import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  FrontmatterError,
  discoverPromptFiles,
  parseFrontmatter,
  validateFrontmatterFile,
} from '../scripts/frontmatter.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');

test('all repository skills and agents have valid frontmatter', () => {
  const prompts = discoverPromptFiles(repoRoot);
  assert.ok(prompts.some(({ kind }) => kind === 'skill'));
  assert.ok(prompts.some(({ kind }) => kind === 'agent'));
  for (const prompt of prompts) {
    assert.doesNotThrow(() => validateFrontmatterFile(prompt.filePath, prompt.kind), prompt.filePath);
  }
});

test('surprise-auditor description is valid YAML despite its colon-heavy prose', () => {
  const filePath = path.join(repoRoot, 'agents', 'surprise-auditor.md');
  const result = validateFrontmatterFile(filePath, 'agent');
  assert.equal(result.data.name, 'surprise-auditor');
});

test('malformed and incomplete frontmatter fails closed with structured errors', () => {
  const cases = [
    ['missing opening fence', 'name: fixture\n---\n', 'MISSING_OPENING_FENCE'],
    ['missing closing fence', '---\nname: fixture\n', 'MISSING_CLOSING_FENCE'],
    ['missing required field', '---\nname: fixture\ndescription: test\n---\n', 'MISSING_REQUIRED_FIELD'],
    ['name/path mismatch', '---\nname: other\ndescription: test\nallowed-tools: [Read]\ntriggers: [test]\n---\n', 'NAME_PATH_MISMATCH'],
    ['duplicate key', '---\nname: fixture\nname: fixture\ndescription: test\nallowed-tools: [Read]\ntriggers: [test]\n---\n', 'INVALID_YAML'],
    ['invalid YAML', '---\nname: [fixture\ndescription: test\nallowed-tools: [Read]\ntriggers: [test]\n---\n', 'INVALID_YAML'],
  ];
  for (const [label, text, code] of cases) {
    assert.throws(
      () => parseFrontmatter(text, { filePath: 'skills/fixture/SKILL.md', kind: 'skill' }),
      (error) => error instanceof FrontmatterError && error.code === code,
      label,
    );
  }
});

test('new prompt fixtures are discovered without verifier code changes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mckee-frontmatter-'));
  try {
    fs.mkdirSync(path.join(root, 'skills', 'new-skill'), { recursive: true });
    fs.mkdirSync(path.join(root, 'agents'), { recursive: true });
    fs.writeFileSync(
      path.join(root, 'skills', 'new-skill', 'SKILL.md'),
      '---\nname: new-skill\ndescription: test\nallowed-tools: [Read]\ntriggers: [test]\n---\n',
    );
    fs.writeFileSync(
      path.join(root, 'agents', 'new-agent.md'),
      '---\nname: new-agent\ndescription: test\ntools: Read\nmodel: sonnet\n---\n',
    );
    const prompts = discoverPromptFiles(root);
    assert.deepEqual(prompts.map(({ kind, filePath }) => [kind, path.basename(filePath)]), [
      ['agent', 'new-agent.md'],
      ['skill', 'SKILL.md'],
    ]);
    for (const prompt of prompts) validateFrontmatterFile(prompt.filePath, prompt.kind);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
