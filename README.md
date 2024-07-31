# my-typescript-library-starter

A boilerplate (template starter) for starting a TypeScript library with ease; equipped with:

 - **ESLint**: auto fix for formatting (no Prettier needed)
 - **Commitizen**: conventional commit interactive-cli helper
 - **Husky**: enforce eslint rules, conventional commit message before each commit
 - **Release-it**: semantic versioning, release management and publishing to npm or github/gitlab with interactive-cli helper
 - **Changelogen**: auto-generated beautiful change-log based on conventional commits

## Usage
**1) clone:** first clone the repo (our used the github green button `Use this template` on the top-right of this window and change project-related fields in package json.
> [!IMPORTANT]
> After cloning the repo, replace `name`, `version`, `description`, `author`, `homepage` and `repository related links` fields in `package.json` to use this template.

** ** Now enter repo's directory and **install dependency** using 'npm' or 'pnpm':

``` shell
pnpm i
```

**2)** to **build** project:
``` shell
pnpm build
```

**3)** to **commit** using commitizen-cli, after adding modified files to  stage, enter `pnpm commit` instead of `git commit`:
``` shell
git add .
pnpm commit
```

**4)** to **release** using release-it cli:
``` sell
pnpm release
```
after releasing the `change-log doc` automatically generated to `CHANGELOG.md` file at the root of the project.

## ESLint & ESLint Configuration
We use @antfu amazing eslint configuration. Js file `eslint.config.js` configures the `eslint`. It extends antfu's configuration but you can customize it. for example if you prefer to use double-quotations for string, change this file as:

``` javascript
import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    quotes: 'double'
  },
})
```
## Conventional Commits & Husky Hooks
we use `Commitizen` for conventional commits. `husky` is used to enforce conventional commit messages with `commitlint`.

## Test & Test Coverage
`Vitest` is used for running tests and measure test coverage.

`coverage-v8` is used to obtain coverage metrics.

The test and coverage config file is `vitest.config.ts`. for example to exclude config files in the root of project from coverage analysis, we config `vitest.config.ts` like follow:

```js
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        ...configDefaults.exclude,
        '*.config.js',
        '*.config.ts',
      ],
    },
  },
})
```

## Release-it for Releasing
We use `release-it` for version management and publish to anywhere (npm or github). We also use its hooks to execute any command we need to test, build, and publish our project.

## Auto Changelog based on Conventional Commits
We use `changelogen` to generate beautiful changelogs using Conventional Commits.

## CSpell
`CSpell` used to automatically check for spelling errors when committing files and writing commit messages.

If there are spelling errors in the staged files for commit, `husky` will prevent you from committing.
Also, if the commit message text has spelling errors, `husky` will still prevent the commit.

Additional Notes:

 - You can configure CSpell in `cspell.json` file in your project directory.
 - You can list words that you want `CSpell` to ignore in `/project-words.txt` file.

## License
[MIT](./LICENSE) License
