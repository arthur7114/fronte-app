import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

/**
 * Deployment Script for Super Monorepo
 * 
 * This script:
 * 1. Bumps the version in root, apps/web, and apps/worker.
 * 2. Creates a git tag.
 * 3. Triggers deployment webhooks for web and worker.
 */

const WEBHOOK_WEB = process.env.DEPLOY_WEBHOOK_WEB;
const WEBHOOK_WORKER = process.env.DEPLOY_WEBHOOK_WORKER;

function log(msg) {
  console.log(`[DEPLOY] ${msg}`);
}

function error(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(1);
}

function run(cmd) {
  try {
    log(`Running: ${cmd}`);
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (err) {
    error(`Command failed: ${cmd}\n${err.stderr?.toString() || err.message}`);
  }
}

async function triggerWebhook(name, url, version) {
  if (!url) {
    log(`Skipping ${name} webhook (URL not set)`);
    return;
  }

  log(`Triggering ${name} deployment at ${url}...`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version,
        timestamp: new Date().toISOString(),
        deployedBy: 'Antigravity Agent'
      })
    });

    if (response.ok) {
      log(`✅ ${name} webhook triggered successfully.`);
    } else {
      const text = await response.text();
      log(`⚠️ ${name} webhook returned status ${response.status}: ${text}`);
    }
  } catch (err) {
    log(`❌ Failed to trigger ${name} webhook: ${err.message}`);
  }
}

async function main() {
  log('Starting deployment workflow...');

  // 1. Check git status
  const status = run('git status --porcelain');
  if (status && !process.argv.includes('--force')) {
    log('⚠️ Working directory is not clean. Commit your changes first or use --force.');
    // In some cases we might want to continue, but safe defaults are better.
  }

  // 2. Versioning
  log('Bumping versions...');
  // Bump root version
  const newVersion = run('npm version patch --no-git-tag-version');
  log(`New version: ${newVersion}`);

  // Sync sub-apps versions
  const pkgPaths = [
    path.join(process.cwd(), 'apps/web/package.json'),
    path.join(process.cwd(), 'apps/worker/package.json')
  ];

  for (const pkgPath of pkgPaths) {
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      pkg.version = newVersion.replace(/^v/, '');
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      log(`Updated ${pkg.name} to ${pkg.version}`);
    }
  }

  // 3. Commit and Tag
  log('Committing version bump and creating tag...');
  run(`git add .`);
  run(`git commit -m "chore: bump version to ${newVersion}"`);
  run(`git tag ${newVersion}`);
  log(`Created git tag ${newVersion}`);

  // 4. Push to origin
  log('Pushing to origin...');
  try {
    run(`git push origin main`); // Assuming main branch
    run(`git push origin --tags`);
    log('✅ Pushed to origin successfully.');
  } catch (err) {
    log('⚠️ Failed to push to origin. You may need to push manually.');
    // Don't exit here, maybe the user wants to trigger webhooks anyway?
    // Actually, if pushing fails, deployment will likely fail on the server.
    if (!process.argv.includes('--ignore-push-fail')) {
       error('Push failed. Aborting webhooks. Use --ignore-push-fail to continue anyway.');
    }
  }

  // 5. Webhooks
  await triggerWebhook('Web App', WEBHOOK_WEB, newVersion);
  await triggerWebhook('Worker App', WEBHOOK_WORKER, newVersion);

  log('🚀 Deployment workflow completed!');
  log(`Current version: ${newVersion}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
