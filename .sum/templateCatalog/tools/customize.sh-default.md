#!/bin/bash

# Read values from a JSON file
CONFIG_FILE="tools/customize.json"

# Check that the JSON file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "File JSON ($CONFIG_FILE) doesn't exist."
    exit 1
fi

replace_in_file() {
    local placeholder="$1"
    local value="$2"
    local file="$3"
    sed -i.mybak "s/$placeholder/$value/g" "$file"
}

get_value_from_json() {
    local file="$1"
    local key="$2"
    local value
    value=$(grep "\"$key\"" "$file" | sed -n 's/.*: "\(.*\)",$/\1/p')
    echo "$value"
}

# Odczytaj zmienne z pliku JSON
FULL_NAME=$(get_value_from_json "$CONFIG_FILE" "FULL_NAME")
PAGE_AUTHOR=$(get_value_from_json "$CONFIG_FILE" "PAGE_AUTHOR")
GITHUB_USER=$(get_value_from_json "$CONFIG_FILE" "GITHUB_USER")
REPO_NAME=$(get_value_from_json "$CONFIG_FILE" "REPO_NAME")
NODE_VERSION=$(get_value_from_json "$CONFIG_FILE" "NODE_VERSION")
NPM_USER=$(get_value_from_json "$CONFIG_FILE" "NPM_USER")

# Wyświetl odczytane wartości
echo "FULL_NAME: $FULL_NAME"
echo "PAGE_AUTHOR: $PAGE_AUTHOR"
echo "GITHUB_USER: $GITHUB_USER"
echo "REPO_NAME: $REPO_NAME"
echo "NODE_VERSION: $NODE_VERSION"
echo "NPM_USER: $NPM_USER"

# Use the sed command to edit files
# Create backup copies of the original files with the .mybak extension
# Then perform replacements in the files based on local variables


replace_in_file "PLACEHOLDER_FULL_NAME" "$FULL_NAME" "package.json"
replace_in_file "PLACEHOLDER_FULL_NAME" "$FULL_NAME" "README.md"
replace_in_file "PLACEHOLDER_FULL_NAME" "$FULL_NAME" "./docs/HowToAutoDeploy.md"
replace_in_file "PLACEHOLDER_FULL_NAME" "$FULL_NAME" ".github/FUNDING.yml"

replace_in_file "PLACEHOLDER_PAGE_AUTHOR" "$PAGE_AUTHOR" ".github/FUNDING.yml"
replace_in_file "PLACEHOLDER_PAGE_AUTHOR" "$PAGE_AUTHOR" "package.json"
replace_in_file "PLACEHOLDER_PAGE_AUTHOR" "$PAGE_AUTHOR" "LICENSE"

CURRENT_YEAR=$(date +%Y)
replace_in_file "PLACEHOLDER_CURRENT_YEAR" "$CURRENT_YEAR" "LICENSE"

replace_in_file "PLACEHOLDER_GITHUB_USER" "$GITHUB_USER" "package.json"
replace_in_file "PLACEHOLDER_GITHUB_USER" "$GITHUB_USER" "README.md"
replace_in_file "PLACEHOLDER_GITHUB_USER" "$GITHUB_USER" "./docs/HowToAutoDeploy.md"
replace_in_file "PLACEHOLDER_GITHUB_USER" "$GITHUB_USER" ".github/FUNDING.yml"

replace_in_file "20.11.0" "$NODE_VERSION" "package.json"
replace_in_file "PLACEHOLDER_NODE_VERSION" "$NODE_VERSION" ".nvmrc"
replace_in_file "PLACEHOLDER_NODE_VERSION" "$NODE_VERSION" ".github/nodejs.version"

replace_in_file "placeholder-repo-name" "$REPO_NAME" "package.json"
replace_in_file "PLACEHOLDER_REPO_NAME" "$REPO_NAME" "package.json"
replace_in_file "PLACEHOLDER_REPO_NAME" "$REPO_NAME" "tools/addDependency.js"
replace_in_file "A template for creating npm packages using TypeScript" "$REPO_NAME is npm package to ..." "package.json"
replace_in_file "A template for creating npm packages using TypeScript" "$REPO_NAME is npm package to ..." "README.md"
replace_in_file "PLACEHOLDER_REPO_NAME" "$REPO_NAME" "README.md"
replace_in_file "PLACEHOLDER_REPO_NAME" "$REPO_NAME" "./docs/HowToAutoDeploy.md"

replace_in_file "PLACEHOLDER_NPM_USER" "$NPM_USER" "README.md"

replace_in_file "PLACEHOLDER_NPM_USER" "$NPM_USER" "./docs/HowToAutoDeploy.md"

rm *.mybak
rm .*.mybak
rm **/*.mybak
rm .**/*.mybak

# Display a message upon completion
echo "Finished editing files."

yarn install

echo "Package installed"
