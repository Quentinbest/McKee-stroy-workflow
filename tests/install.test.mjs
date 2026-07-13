import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(import.meta.dirname, '..');
const installer = path.join(repoRoot, 'install.sh');
const firstSkill = fs.readdirSync(path.join(repoRoot, 'skills'), { withFileTypes: true })
  .find((entry) => entry.isDirectory())?.name;
const firstAgent = fs.readdirSync(path.join(repoRoot, 'agents'))
  .find((entry) => entry.endsWith('.md'));

function runInstaller({ home, projectDir, input = '', args = [] }) {
  return spawnSync('bash', [installer, ...args, '--project-dir', projectDir], {
    cwd: repoRoot,
    env: { ...process.env, HOME: home },
    input,
    encoding: 'utf8',
  });
}

function makeSandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mckee-install-'));
  const home = path.join(root, 'home');
  const project = path.join(root, 'project');
  fs.mkdirSync(home);
  fs.mkdirSync(project);
  return { root, home, project };
}

function removeSandbox(root) {
  fs.rmSync(root, { recursive: true, force: true });
}

test('fresh install scaffolds a draft and records managed agents', () => {
  const { root, home, project } = makeSandbox();
  try {
    const result = runInstaller({ home, projectDir: project, input: 'clockmaker\n' });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(fs.existsSync(path.join(project, 'drafts', 'clockmaker', 'lifecycle.json')));
    const manifest = path.join(project, '.claude', 'agents', '.mckee-story-workflow-manifest');
    assert.ok(fs.existsSync(manifest));
    assert.match(fs.readFileSync(manifest, 'utf8'), new RegExp(firstAgent));
  } finally {
    removeSandbox(root);
  }
});

test('reinstall preserves existing draft lifecycle and state', () => {
  const { root, home, project } = makeSandbox();
  try {
    const draft = path.join(project, 'drafts', 'kept-story');
    fs.mkdirSync(draft, { recursive: true });
    fs.writeFileSync(path.join(draft, 'lifecycle.json'), '{"current_stage":"custom"}\n');
    fs.writeFileSync(path.join(draft, 'state.json'), '{"custom":true}\n');
    const beforeLifecycle = fs.readFileSync(path.join(draft, 'lifecycle.json'), 'utf8');
    const beforeState = fs.readFileSync(path.join(draft, 'state.json'), 'utf8');

    const result = runInstaller({ home, projectDir: project });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.readFileSync(path.join(draft, 'lifecycle.json'), 'utf8'), beforeLifecycle);
    assert.equal(fs.readFileSync(path.join(draft, 'state.json'), 'utf8'), beforeState);
    assert.match(result.stdout, /already initialized|existing draft/i);
  } finally {
    removeSandbox(root);
  }
});

test('managed skill replacement removes stale files while keeping a backup', () => {
  assert.ok(firstSkill, 'repository must contain at least one skill');
  const { root, home, project } = makeSandbox();
  try {
    const first = runInstaller({ home, projectDir: project, input: 'first-story\n' });
    assert.equal(first.status, 0, first.stderr);
    const installedSkill = path.join(home, '.claude', 'skills', firstSkill);
    const stale = path.join(installedSkill, 'stale-from-previous-install.txt');
    fs.writeFileSync(stale, 'must disappear from active tree');

    const second = runInstaller({ home, projectDir: project });
    assert.equal(second.status, 0, second.stderr);
    assert.equal(fs.existsSync(stale), false);
    const backups = path.join(home, '.claude', 'skills', '.mckee-story-workflow-backups');
    const backupMatches = fs.readdirSync(backups).filter((name) => name.startsWith(`${firstSkill}.`));
    assert.ok(backupMatches.length > 0, 'replacement should retain a backup');
    assert.equal(
      fs.existsSync(path.join(backups, backupMatches.at(-1), 'stale-from-previous-install.txt')),
      true,
    );
  } finally {
    removeSandbox(root);
  }
});

test('stale managed skill directories are removed while custom skill directories remain', () => {
  const { root, home, project } = makeSandbox();
  try {
    const first = runInstaller({ home, projectDir: project, input: 'skill-manifest-story\n' });
    assert.equal(first.status, 0, first.stderr);
    const skillsDir = path.join(home, '.claude', 'skills');
    const retired = path.join(skillsDir, 'retired-skill');
    const custom = path.join(skillsDir, 'custom-local-skill');
    fs.mkdirSync(retired);
    fs.mkdirSync(custom);
    fs.writeFileSync(path.join(retired, 'old.md'), 'retired');
    fs.writeFileSync(path.join(custom, 'keep.md'), 'custom');
    fs.appendFileSync(path.join(skillsDir, '.mckee-story-workflow-skills-manifest'), 'retired-skill\n');

    const second = runInstaller({ home, projectDir: project });
    assert.equal(second.status, 0, second.stderr);
    assert.equal(fs.existsSync(retired), false);
    assert.equal(fs.readFileSync(path.join(custom, 'keep.md'), 'utf8'), 'custom');
    assert.match(second.stdout, /Removed stale managed skill/);
  } finally {
    removeSandbox(root);
  }
});

test('agent manifest removes stale managed files but preserves unmanifested custom agents', () => {
  assert.ok(firstAgent, 'repository must contain at least one agent');
  const { root, home, project } = makeSandbox();
  try {
    const first = runInstaller({ home, projectDir: project, input: 'agent-story\n' });
    assert.equal(first.status, 0, first.stderr);
    const agentsDir = path.join(project, '.claude', 'agents');
    const staleManaged = 'retired-agent.md';
    const custom = 'my-custom-agent.md';
    fs.writeFileSync(path.join(agentsDir, staleManaged), 'stale');
    fs.writeFileSync(path.join(agentsDir, custom), 'custom');
    fs.appendFileSync(path.join(agentsDir, '.mckee-story-workflow-manifest'), `${staleManaged}\n`);

    const second = runInstaller({ home, projectDir: project });
    assert.equal(second.status, 0, second.stderr);
    assert.equal(fs.existsSync(path.join(agentsDir, staleManaged)), false);
    assert.equal(fs.readFileSync(path.join(agentsDir, custom), 'utf8'), 'custom');
  } finally {
    removeSandbox(root);
  }
});

test('legacy agents without a manifest are preserved and reported', () => {
  const { root, home, project } = makeSandbox();
  try {
    const agentsDir = path.join(project, '.claude', 'agents');
    fs.mkdirSync(agentsDir, { recursive: true });
    fs.writeFileSync(path.join(agentsDir, 'legacy-agent.md'), 'legacy');
    const result = runInstaller({ home, projectDir: project, input: 'legacy-story\n' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.readFileSync(path.join(agentsDir, 'legacy-agent.md'), 'utf8'), 'legacy');
    assert.match(result.stdout, /unmanaged|legacy-agent\.md/i);
  } finally {
    removeSandbox(root);
  }
});

test('invalid slug fails before creating a draft', () => {
  const { root, home, project } = makeSandbox();
  try {
    const result = runInstaller({ home, projectDir: project, input: 'Not Valid!\n' });
    assert.notEqual(result.status, 0);
    assert.equal(fs.existsSync(path.join(project, 'drafts')), false);
  } finally {
    removeSandbox(root);
  }
});

test('dry-run does not mutate existing installation or project', () => {
  assert.ok(firstSkill, 'repository must contain at least one skill');
  const { root, home, project } = makeSandbox();
  try {
    const skillDir = path.join(home, '.claude', 'skills', firstSkill);
    fs.mkdirSync(skillDir, { recursive: true });
    const marker = path.join(skillDir, 'keep.txt');
    fs.writeFileSync(marker, 'keep');
    const result = runInstaller({ home, projectDir: project, args: ['--dry-run'] });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.readFileSync(marker, 'utf8'), 'keep');
    assert.equal(fs.existsSync(path.join(project, 'drafts')), false);
    assert.equal(fs.existsSync(path.join(home, '.claude', 'skills', '.mckee-story-workflow-stage')), false);
  } finally {
    removeSandbox(root);
  }
});

test('staging failure leaves the existing managed skill untouched', () => {
  assert.ok(firstSkill, 'repository must contain at least one skill');
  const { root, home, project } = makeSandbox();
  try {
    const first = runInstaller({ home, projectDir: project, input: 'failure-story\n' });
    assert.equal(first.status, 0, first.stderr);
    const skillsDir = path.join(home, '.claude', 'skills');
    const installedSkill = path.join(skillsDir, firstSkill);
    const marker = path.join(installedSkill, 'preserve-on-failure.txt');
    fs.writeFileSync(marker, 'preserve');
    fs.chmodSync(skillsDir, 0o500);
    const failed = runInstaller({ home, projectDir: project });
    assert.notEqual(failed.status, 0);
    fs.chmodSync(skillsDir, 0o755);
    assert.equal(fs.readFileSync(marker, 'utf8'), 'preserve');
  } finally {
    try { fs.chmodSync(path.join(home, '.claude', 'skills'), 0o755); } catch {}
    removeSandbox(root);
  }
});
