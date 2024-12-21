echo \[🐶 Husky] Running pre-commit hook...\

# Get current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)

# Check if we're not on main branch
if [ "$current_branch" != "main" ]; then
    echo "🔍 Checking for main branch updates..."

    # Fetch latest changes from remote
    git fetch origin main

    # Check if current branch is behind main
    if git merge-base --is-ancestor HEAD origin/main; then
        echo "✅ Your branch is up to date with main"
    else
        behind_commits=$(git rev-list HEAD..origin/main --count)
        if [ "$behind_commits" -gt 0 ]; then
            echo "⚠️ Your branch is behind main by $behind_commits commits! Update your branch before committing."
            echo "Run: git merge origin/main"
            exit 1
        fi
    fi
fi

yarn husky:pre-commit
echo \[🐶 Husky] Done ✅ pre-commit hook...\

exit 0
