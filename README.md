# gpt-shell-access

## 🚧 Under Development 🚧

**Disclaimer: This tool is under active development. Backup your code before running it.**
**NO GUARANTEES! USE AT YOUR OWN RISK!!!**


An AI-powered tool that seamlessly integrates with your terminal to intelligently diagnose and optimize command issues. The tool will modify the necessary files and rerun the command until it succeeds.

## Installation

To install globally, run:

```bash
npm install -g gpt-shell-access
```

## Requirements

- OPEN_API_KEY environment variable set with your OpenAI API key.

## Usage

After installation, run:

```bash
gpt-shell-access
```

It will prompt you to enter the directory where the command should be executed and the command itself. It will then proceed to automatically fix the command and rerun it.

## Sample Run

Before running `gpt-shell-access`, `npm run lint` produced the following errors:

```bash
src/main.ts
   3:85  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   4:3   error  Unnecessary try/catch wrapper             no-useless-catch
  ...
```

After running `gpt-shell-access` and answering its prompts:

```bash
Please enter directory where the command should be executed. Leave empty to use current dir:
Please enter the command you want to run and fix: npm run lint
```

The tool automatically corrected the files:

```bash
 - Updating src/main.ts:3-3
-------------
...
```

And the subsequent `npm run lint` run was successful.

## Contributing

For bugs and feature requests, please create an issue on [GitHub](https://github.com/ahmed-anas/gpt-shell-access/issues).

## License

MIT


<details>
    <summary> Sample full run on test project</summary>

-> npm run lint

> test-project@1.0.0 lint
> eslint "src/**/*.{ts,tsx}"


G:\work\personal-code\gpt-shell-access\test-project\src\main.ts
   3:85  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   4:3   error  Unnecessary try/catch wrapper             no-useless-catch
  10:60  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  16:55  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  22:62  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 5 problems (5 errors, 0 warnings)

-> gpt-shell-access
Please enter directory where the command should be executed. Leave empty to use current dir:
Please enter the command you want to run and fix: npm run lint

 - Reading G:\work\personal-code\gpt-shell-access\test-project\src\main.ts:0-32
---------------
1: import axios from 'axios';
2:
3: export async function getCommentsForMatchingPosts(partialPostName: string): Promise<any[]> {
4:   try {
5:     const postsResponse = await axios.get('https://jsonplaceholder.typicode.com/posts');
6:     if (postsResponse.status !== 200) {
7:       throw new Error('Unknown status code returned');
8:     }
9:
10:     const matchingPosts = postsResponse.data.filter((post: any) => post.title.includes(partialPostName));
11:
12:     if (matchingPosts.length === 0) {
13:       throw new Error('No matching posts found.');
14:     }
15:
16:     const commentsPromises = matchingPosts.map((post: any) =>
17:       axios.get(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`)
18:     );
19:
20:     const commentsResponses = await Promise.all(commentsPromises);
21:
22:     const allComments = commentsResponses.flatMap((response: any) => {
23:       if (response.status !== 200) {
24:         throw new Error('Unknown status code returned');
25:       }
26:       return response.data;
27:     });
28:
29:     return allComments;
30:   } catch (error) {
31:     throw error;
32:   }
---------------
 - Updating G:\work\personal-code\gpt-shell-access\test-project\src\main.ts:3-3
-------------
export async function getCommentsForMatchingPosts(partialPostName: string): Promise<unknown[]> {
-------------
 - Updating G:\work\personal-code\gpt-shell-access\test-project\src\main.ts:4-32
-------------
  try {
    const postsResponse = await axios.get('https://jsonplaceholder.typicode.com/posts');
    if (postsResponse.status !== 200) {
      throw new Error('Unknown status code returned');
    }

    const matchingPosts = postsResponse.data.filter((post: Record<string, unknown>) => post.title.includes(partialPostName));

    if (matchingPosts.length === 0) {
      throw new Error('No matching posts found.');
    }

    const commentsPromises = matchingPosts.map((post: Record<string, unknown>) =>
      axios.get(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`)
    );

    const commentsResponses = await Promise.all(commentsPromises);

    const allComments = commentsResponses.flatMap((response: Record<string, unknown>) => {
      if (response.status !== 200) {
        throw new Error('Unknown status code returned');
      }
      return response.data;
    });

    return allComments;
  } catch (error) {
    throw error;
  }
-------------
 - re-running command
 - command output
------------------

> test-project@1.0.0 lint
> eslint "src/**/*.{ts,tsx}"


G:\work\personal-code\gpt-shell-access\test-project\src\main.ts
  4:3  error  Unnecessary try/catch wrapper  no-useless-catch

✖ 1 problem (1 error, 0 warnings)


------------------
 - Updating G:\work\personal-code\gpt-shell-access\test-project\src\main.ts:4-32
-------------
const postsResponse = await axios.get('https://jsonplaceholder.typicode.com/posts');
    if (postsResponse.status !== 200) {
      throw new Error('Unknown status code returned');
    }

    const matchingPosts = postsResponse.data.filter((post: Record<string, unknown>) => post.title.includes(partialPostName));

    if (matchingPosts.length === 0) {
      throw new Error('No matching posts found.');
    }

    const commentsPromises = matchingPosts.map((post: Record<string, unknown>) =>
      axios.get(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`)
    );

    const commentsResponses = await Promise.all(commentsPromises);

    const allComments = commentsResponses.flatMap((response: Record<string, unknown>) => {
      if (response.status !== 200) {
        throw new Error('Unknown status code returned');
      }
      return response.data;
    });

    return allComments;
-------------
 - re-running command
ai output The following operations were performed to fix the issues:
- Replaced 'any' type with 'unknown' in the Promise return type of the function 'getCommentsForMatchingPosts'.
- Replaced 'any' type with 'Record<string, unknown>' for the 'post' and 'response' objects.
- Removed unnecessary try/catch wrapper.
After these changes, the 'npm run lint' command was executed again and no errors were found.

</details>