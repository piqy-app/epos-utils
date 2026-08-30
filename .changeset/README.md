# Changesets

Run `pnpm changeset` for each change that affects package users.

Write the note for a person who uses the package:

- Start with what changed and why it matters.
- Name new, changed, and removed exports.
- Add a short code example when an API changes.
- Use a before-and-after example when migration is not clear.
- Leave out build tools and internal implementation details.
- Use short sentences and common words.

The note becomes part of the package changelog. It must make sense without the commit message or pull request.

The release workflow creates a version pull request. Merging that pull request publishes the packages to npm.
