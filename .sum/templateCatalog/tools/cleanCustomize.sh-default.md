remove_file() {
  if [ -e "$1" ]; then
    rm "$1"
    echo "Deleted $1"
  fi
}

remove_files_in_directory() {
  local directory="$1"

  if [ -d "$directory" ]; then
    rm -rf "$directory"
    echo "Directory $directory and all its contents were deleted."
  else
    echo "The directory $directory does not exist."
  fi
}

remove_file "tools/customize.sh"
remove_file "tools/customize.json"
remove_file "tools/customize.example.json"
remove_file "tools/cleanCustomize.sh"
remove_file "todo.md"
remove_files_in_directory "docs"

echo "Deleted files."
