if (process.env.CI !== "true" || process.env.GITHUB_ACTIONS !== "true") {
  console.error(
    "Production deployment is owned by the GitHub Actions Deploy workflow.",
  );
  process.exit(1);
}
