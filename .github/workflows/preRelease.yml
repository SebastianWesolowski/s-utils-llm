# Reusable workflow for releases; to eject, you can replace this file with
# https://github.com/SebastianWesolowski/SebastianWesolowski/blob/main/.github/workflows/release.yml
name: Pre Release
on:
  push:
    branches:
      - dev
jobs:
  preRelease:
    name: Pre Release
    runs-on: ubuntu-latest
    steps:
      - name: '📝 Checkout'
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GH_TOKEN }}

      - name: '📥 Read Node.js version'
        run: echo "node_version=$(cat .github/nodejs.version)" >> $GITHUB_ENV

      - name: '🟢 Setup Node.js ${{ env.node_version }}'
        uses: actions/setup-node@v4
        with:
          node-version: '${{ env.node_version }}'
          cache: 'yarn'
      - name: '📦 Install dependencies'
        run: yarn install --frozen-lockfile --ignore-scripts --omit=dev

      - name: '🔍 Check next release version'
        id: next-version
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: |
          NEXT_VERSION=$(npx semantic-release --dry-run | grep "next release version is" -i | sed 's/.*is //')
          echo "Next version will be: $NEXT_VERSION"
          echo "version=$NEXT_VERSION" >> $GITHUB_OUTPUT

      - name: '🗑️ Clean specific tag if exists'
        if: steps.next-version.outputs.version != ''
        run: |
          echo "Cleaning tag v${{ steps.next-version.outputs.version }}"
          git tag -d "v${{ steps.next-version.outputs.version }}" 2>/dev/null || true
          git push origin ":refs/tags/v${{ steps.next-version.outputs.version }}" 2>/dev/null || true

      - name: '🚀 Release to NPM and GitHub'
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: yarn build:release

      - name: '📋 Post Release Status'
        if: always()
        run: |
          if [ "${{ job.status }}" == "success" ]; then
            echo "✅ Release completed successfully"
            echo "Version: v${{ steps.next-version.outputs.version }}"
          else
            echo "❌ Release failed"
            echo "Please check the logs for more information"
          fi
