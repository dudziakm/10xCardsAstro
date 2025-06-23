#!/usr/bin/env node

/**
 * Smart security audit script that ignores only known Vercel vulnerabilities
 * but fails on any other security issues in the project.
 */

import { execSync } from 'child_process';

// Known vulnerable packages to ignore (only Vercel-related ones)
const IGNORED_PACKAGES = [
  '@vercel/routing-utils',
  '@astrojs/vercel',
  'path-to-regexp', // Known issue in @astrojs/vercel routing-utils
];

function runSecurityAudit() {
  try {
    console.log('🔍 Running security audit...');
    
    // Run npm audit and capture output
    let auditOutput;
    try {
      auditOutput = execSync('npm audit --json', { encoding: 'utf-8' });
    } catch (auditError) {
      // npm audit returns exit code 1 when vulnerabilities found, but still outputs JSON
      auditOutput = auditError.stdout;
    }
    
    const auditData = JSON.parse(auditOutput);
    
    if (!auditData.vulnerabilities || Object.keys(auditData.vulnerabilities).length === 0) {
      console.log('✅ No vulnerabilities found');
      return true;
    }
    
    const vulnerabilities = Object.entries(auditData.vulnerabilities);
    const criticalIssues = [];
    let ignoredCount = 0;
    
    // Check each vulnerability
    for (const [packageName, vulnData] of vulnerabilities) {
      // Check if this is a Vercel-related package we want to ignore
      const isIgnoredPackage = IGNORED_PACKAGES.some(ignored => 
        packageName === ignored
      );
      
      if (isIgnoredPackage) {
        console.log(`⚠️  Ignoring known issue in ${packageName} (Vercel dependency)`);
        ignoredCount++;
      } else {
        criticalIssues.push({
          package: packageName,
          severity: vulnData.severity,
          title: vulnData.name || packageName
        });
      }
    }
    
    if (criticalIssues.length > 0) {
      console.log('\n❌ Critical security issues found in YOUR project:');
      criticalIssues.forEach(issue => {
        console.log(`   - ${issue.package}: ${issue.title} (${issue.severity})`);
      });
      console.log('\n💡 Please fix these vulnerabilities before deploying');
      return false;
    }
    
    console.log(`✅ Security audit passed (${ignoredCount} known Vercel issues ignored)`);
    return true;
    
  } catch (error) {
    console.error('❌ Security audit failed:', error.message);
    return false;
  }
}

// Run the security check
const success = runSecurityAudit();
process.exit(success ? 0 : 1);