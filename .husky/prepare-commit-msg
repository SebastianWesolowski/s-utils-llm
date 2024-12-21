echo "[🐶 Husky] Running prepare-commit-msg hook..."

commit_msg_file="$1"
commit_source="$2"

# Extract emoji from commit message
get_emoji() {
    [[ $1 =~ [✨🐛📚️💄♻️⚡🚨📦🎡🔧⏪] ]] && echo "${BASH_REMATCH[0]}"
}

# Extract issue number from commit message
get_issue_number() {
    echo "$1" | grep -oE "SC-[0-9]+" | head -n1
}

# Extract commit message content
get_commit_message() {
    local commit_msg="$1"
    local used_emoji="$2"
    local issue_number="$3"

    # Remove commit type, emoji, issue number, and trim whitespace
    echo "$commit_msg" | sed -E 's/^[^:]+: *//; s/^[[:space:]]*'"$used_emoji"'[[:space:]]*//' |
        sed -E 's/[[:space:]]*'"$issue_number"'[[:space:]]*//g; s/^[[:space:]]+|[[:space:]]+$//g'
}

# Extract commit type
get_commit_type() {
    local commit_type=$(echo "$1" | sed -nE 's/^([a-z]+):.*/\1/p')
    local valid_types="feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert"

    [[ -n "$commit_type" && "$commit_type" =~ ^($valid_types)$ ]] && echo "$commit_type" || echo ""
}

# Update commit message file
update_commit_message() {
    local commit_type="$1"
    local emoji="$2"
    local issue_number="$3"
    local commit_content="$4"
    local commit_msg_file="$5"

    echo "$commit_type: $emoji [$issue_number] $commit_content" > "$commit_msg_file"
    sed -i.bak '/^$/d' "$commit_msg_file" && rm "${commit_msg_file}.bak"
}


# Skip processing for amend commits
if [ "$commit_source" = "commit" ] || [ "$commit_source" = "message" ]; then
    echo "[🐶 Husky] Amend commit detected. Skipping prepare-commit-msg script."
    echo "[🐶 Husky] Done ✅ prepare-commit-msg hook..."
    exit 0
fi
# Run commitlint
commitlint_output=$(yarn commitlint --edit "$commit_msg_file" 2>&1)
commitlint_exit_code=$?

if [ "$commitlint_exit_code" -ne 1 ]; then
    echo "[🐶 Husky] Commitlint failed. Starting wizard commit message."
    yarn husky:prepare-commit-msg
else
    echo "[🐶 Husky] Commitlint passed. Proceeding with the commit."
fi


format_commit_message() {
    commit_msg=$(cat "$commit_msg_file")
    emoji=$(get_emoji "$commit_msg")
    commit_type=$(get_commit_type "$commit_msg")
    issue_number=$(get_issue_number "$commit_msg")
    commit_content=$(get_commit_message "$commit_msg" "$emoji" "$issue_number")
    update_commit_message "$commit_type" "$emoji" "$issue_number" "$commit_content" "$commit_msg_file"
}

format_commit_message
echo "[🐶 Husky] Done ✅ prepare-commit-msg hook..."
