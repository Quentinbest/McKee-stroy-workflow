import fs from "node:fs";
import path from "node:path";
import process from "node:process";

export const BUILTIN_RULES = Object.freeze({
  strip_authoring_comment: "Remove authoring-only HTML comments from reader-facing text.",
  normalize_blank_lines: "Collapse 3+ consecutive blank lines to 2.",
  locked_term_alias: "Replace exact literal aliases with canonical locked terms."
});

const DEFAULT_PROTECTED_FIELDS = new Set([
  "premise",
  "character_desire",
  "relationship_stance",
  "causality",
  "gap",
  "turning_point",
  "value_shift",
  "world_core_fact"
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function literalRegex(text) {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
}

function hasProtectedDimension(dimensions = [], protectedFields = DEFAULT_PROTECTED_FIELDS) {
  return dimensions.some((dimension) => protectedFields.has(dimension));
}

export function validatePolicy(policy) {
  const errors = [];
  const warnings = [];
  const protectedFields = new Set(policy.protected_fields || []);

  for (const ruleId of policy.auto_rules || []) {
    if (!BUILTIN_RULES[ruleId]) {
      warnings.push({
        code: "unknown_rule",
        rule_id: ruleId,
        message: `Unknown rule '${ruleId}' is ignored.`
      });
    }
  }

  for (const field of protectedFields) {
    if (DEFAULT_PROTECTED_FIELDS.has(field) && (policy.auto_rules || []).includes(field)) {
      errors.push({
        code: "protected_rule_in_auto",
        field,
        message: `Protected field '${field}' cannot appear on the AUTO allowlist.`
      });
    }
  }

  const seenAliases = new Map();
  for (const mapping of policy.term_mappings || []) {
    for (const alias of mapping.aliases || []) {
      const normalized = alias.toLowerCase();
      const existing = seenAliases.get(normalized);
      if (existing && existing !== mapping.canonical) {
        warnings.push({
          code: "ambiguous_term_mapping",
          alias,
          canonicals: [existing, mapping.canonical],
          message: `Alias '${alias}' maps to multiple canonical terms.`
        });
      } else {
        seenAliases.set(normalized, mapping.canonical);
      }
    }
  }

  return { errors, warnings };
}

function buildTermDetections(policy) {
  const detections = [];
  const mappings = [];
  const ambiguousAliases = new Set();
  const aliasToCanonical = new Map();

  for (const mapping of policy.term_mappings || []) {
    for (const alias of mapping.aliases || []) {
      const normalized = alias.toLowerCase();
      const existing = aliasToCanonical.get(normalized);
      if (existing && existing !== mapping.canonical) {
        ambiguousAliases.add(normalized);
        detections.push({
          code: "ambiguous_term_mapping",
          rule_id: "locked_term_alias",
          alias,
          canonicals: [existing, mapping.canonical],
          classification: "REVIEW",
          message: `Alias '${alias}' maps to multiple canonical terms.`
        });
        continue;
      }
      aliasToCanonical.set(normalized, mapping.canonical);
      mappings.push({ alias, canonical: mapping.canonical });
    }
  }

  return { detections, mappings, ambiguousAliases };
}

function createPatch({ ruleId, original, replacement, start, end, dimensions = [], classification = "AUTO" }) {
  return {
    rule_id: ruleId,
    classification,
    original_text: original,
    replacement_text: replacement,
    start,
    end,
    affected_dimensions: dimensions,
    reversible: true,
    explainable: true
  };
}

function applyPatch(text, patch) {
  return text.slice(0, patch.start) + patch.replacement_text + text.slice(patch.end);
}

function normalizeBlankLines(text) {
  const matches = [...text.matchAll(/\n{3,}/g)];
  return matches.map((match) =>
    createPatch({
      ruleId: "normalize_blank_lines",
      original: match[0],
      replacement: "\n\n",
      start: match.index,
      end: match.index + match[0].length
    })
  );
}

function stripAuthoringComments(text) {
  const pattern =
    /<!--\s*(Beat\s+\d+.*?|VOICE CHECK:.*?|SUBTEXT CHECK:.*?)\s*-->(?:\n(?!\n))?/g;
  const patches = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    let end = match.index + match[0].length;
    if (match.index === 0) {
      while (text[end] === "\n") {
        end += 1;
      }
    }
    patches.push(
      createPatch({
        ruleId: "strip_authoring_comment",
        original: text.slice(match.index, end),
        replacement: "",
        start: match.index,
        end
      })
    );
  }
  return patches;
}

function patchesOverlap(left, right) {
  return left.start < right.end && right.start < left.end;
}

function resolvePatchConflicts(patches) {
  const conflicted = new Set();
  const reviewItems = [];

  for (let leftIndex = 0; leftIndex < patches.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < patches.length;
      rightIndex += 1
    ) {
      const left = patches[leftIndex];
      const right = patches[rightIndex];
      if (!patchesOverlap(left, right)) {
        continue;
      }

      const stripPatch =
        left.rule_id === "strip_authoring_comment"
          ? left
          : right.rule_id === "strip_authoring_comment"
            ? right
            : null;
      const nestedPatch = stripPatch === left ? right : left;
      if (
        stripPatch &&
        nestedPatch.start >= stripPatch.start &&
        nestedPatch.end <= stripPatch.end
      ) {
        conflicted.add(nestedPatch);
        continue;
      }

      conflicted.add(left);
      conflicted.add(right);
      reviewItems.push({
        code: "overlapping_auto_patches",
        rule_id: `${left.rule_id}+${right.rule_id}`,
        classification: "REVIEW",
        message:
          "Overlapping deterministic patches were withheld because their combined effect is ambiguous.",
      });
    }
  }

  return {
    patches: patches.filter((patch) => !conflicted.has(patch)),
    reviewItems,
  };
}

function detectMalformedComments(text) {
  const opens = [...text.matchAll(/<!--/g)].length;
  const closes = [...text.matchAll(/-->/g)].length;
  if (opens === closes) {
    return [];
  }
  return [
    {
      code: "malformed_authoring_comment",
      rule_id: "strip_authoring_comment",
      classification: "REVIEW",
      message: "Unbalanced authoring comment markers detected."
    }
  ];
}

function buildLockedTermPatches(text, policy, protectedFields) {
  const { detections, mappings, ambiguousAliases } = buildTermDetections(policy);
  const patches = [];
  const protectedMappings = new Map();

  for (const mapping of policy.term_mappings || []) {
    if (mapping.forced_dimension) {
      protectedMappings.set(mapping.canonical, mapping.forced_dimension);
    }
  }

  for (const { alias, canonical } of mappings) {
    if (ambiguousAliases.has(alias.toLowerCase())) {
      continue;
    }
    const regex = literalRegex(alias);
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[0] === canonical) {
        continue;
      }
      const dimensions = ["locked_term"];
      if (protectedMappings.has(canonical)) {
        dimensions.push(protectedMappings.get(canonical));
      }
      const classification = hasProtectedDimension(dimensions, protectedFields) ? "REJECT" : "AUTO";
      patches.push(
        createPatch({
          ruleId: "locked_term_alias",
          original: match[0],
          replacement: canonical,
          start: match.index,
          end: match.index + match[0].length,
          dimensions,
          classification
        })
      );
    }
  }

  return { patches, detections };
}

export function applyBeatGateRules(input) {
  const policy = clone(input.policy);
  const candidateText = input.candidate_text || "";
  const protectedFields = new Set(policy.protected_fields || []);
  const policyValidation = validatePolicy(policy);
  const detections = [...policyValidation.warnings, ...detectMalformedComments(candidateText)];
  const rejectItems = [];
  const reviewItems = [];
  const autoPatches = [];

  const compiledPatches = [];

  if ((policy.auto_rules || []).includes("strip_authoring_comment")) {
    compiledPatches.push(...stripAuthoringComments(candidateText));
  }
  if ((policy.auto_rules || []).includes("locked_term_alias")) {
    const termResult = buildLockedTermPatches(candidateText, policy, protectedFields);
    compiledPatches.push(...termResult.patches);
    detections.push(...termResult.detections);
  }

  const conflictResolution = resolvePatchConflicts(compiledPatches);
  detections.push(...conflictResolution.reviewItems);

  for (const patch of conflictResolution.patches) {
    if (hasProtectedDimension(patch.affected_dimensions, protectedFields)) {
      rejectItems.push({
        code: "protected_contract_overlap",
        rule_id: patch.rule_id,
        original_text: patch.original_text,
        replacement_text: patch.replacement_text,
        affected_dimensions: patch.affected_dimensions,
        message: `Patch '${patch.rule_id}' touches protected contract fields.`
      });
      continue;
    }
    if (patch.classification === "REJECT") {
      rejectItems.push({
        code: "protected_contract_overlap",
        rule_id: patch.rule_id,
        original_text: patch.original_text,
        replacement_text: patch.replacement_text,
        affected_dimensions: patch.affected_dimensions,
        message: `Patch '${patch.rule_id}' is not eligible for AUTO application.`
      });
      continue;
    }
    autoPatches.push(patch);
  }

  for (const detection of detections) {
    if (detection.classification === "REJECT") {
      rejectItems.push(detection);
    } else {
      reviewItems.push(detection);
    }
  }

  const sortedPatches = [...autoPatches].sort((a, b) => b.start - a.start);
  let outputText = candidateText;
  for (const patch of sortedPatches) {
    outputText = applyPatch(outputText, patch);
  }

  const appliedPatches = [...autoPatches].sort((a, b) => a.start - b.start);
  if ((policy.auto_rules || []).includes("normalize_blank_lines")) {
    const normalizationPatches = normalizeBlankLines(outputText).map(
      (patch) => ({
        ...patch,
        coordinate_space: "output_after_primary_patches"
      })
    );
    for (const patch of [...normalizationPatches].sort(
      (a, b) => b.start - a.start
    )) {
      outputText = applyPatch(outputText, patch);
    }
    appliedPatches.push(...normalizationPatches);
  }

  return {
    version: policy.version,
    output_text: outputText,
    patches: appliedPatches,
    review_items: reviewItems,
    reject_items: rejectItems,
    policy_errors: policyValidation.errors
  };
}

export function validateLedger(ledger) {
  const errors = [];
  const statuses = new Set([
    "drafted",
    "scanned",
    "critiqued",
    "awaiting_writer",
    "accepted",
    "review",
    "rejected",
    "upstream_blocked",
    "deferred_to_batch_boundary"
  ]);

  for (const beat of ledger.beats || []) {
    if (!statuses.has(beat.status)) {
      errors.push(`Beat ${beat.beat_ref} has invalid status '${beat.status}'.`);
    }
    if (beat.status === "accepted" && !["accept", "deferred_to_batch_boundary"].includes(beat.writer_decision)) {
      errors.push(`Beat ${beat.beat_ref} cannot be accepted without a writer decision.`);
    }
    if (beat.deferred_to_batch_boundary && beat.writer_decision !== "deferred_to_batch_boundary") {
      errors.push(`Beat ${beat.beat_ref} must record 'deferred_to_batch_boundary' when deferred.`);
    }
    for (const patch of beat.patches || []) {
      if (!patch.rule_id || patch.original_text === undefined || patch.replacement_text === undefined) {
        errors.push(`Beat ${beat.beat_ref} has incomplete patch evidence.`);
      }
      if (!Array.isArray(patch.affected_dimensions)) {
        errors.push(`Beat ${beat.beat_ref} patch '${patch.rule_id}' is missing affected dimensions.`);
      }
    }
  }

  return errors;
}

function usage() {
  return "Usage: node beat-gate-rules.mjs <input.json>";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error(usage());
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), inputPath);
  const input = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  const result = applyBeatGateRules(input);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
