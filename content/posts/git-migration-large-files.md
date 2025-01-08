---
title: "Git Migration Large Files"
date: 2024-10-24T21:01:45-04:00
draft: false
---

This blog post is going to demo migrating a Git repository that contains large files. An overview of the steps are:

- Create empty repos at [gitlab.com](https://gitlab.com) and [github.com](https://github.com)
- Create demo file structure and push to gitlab.com
- Create a mirror clone of the repo
- Pull down with all branches
- Create large files
- Install git lfs
- Try to use git lfs when there are super large files
- Delete super big files using BFG Repo Cleaner
- Working with files in LFS

## Create empty repos at gitlab.com and github.com

I have already created personal accounts at gitlab.com and github.com. We will use GitLab as the source and GitHub as the target, but these are just examples.

First, let's create an empty repository in GitLab. To do that I browse to [https://gitlab.com/projects/new#blank_project](https://gitlab.com/projects/new#blank_project), login, and fill out the following:
- Project name: demo-large-files
- Project slug: demo-large-files
- Uncheck: Initialize repository with a README
- Leave all the other defaults

![gitlab](/git-migration-large-files/gitlab-repo-create.png)

Next, let's do the same at GitHub. I then browse to [https://github.com/new](https://github.com/new), login, and fill in the following:
- Owner: elijahgagne
- Repository name: demo-large-files
- Leave all the other defaults

![github](/git-migration-large-files/github-repo-create.png)

Following these steps, I now have two empty repositories at:
- https://gitlab.com/egagne/demo-large-files.git
- https://github.com/elijahgagne/demo-large-files.git

## Create demo file structure and push to gitlab.com

I like to work locally as much as possible. I use my Mac's Downloads folder as a "scratch" space of sorts. In the steps below, I do the following:

- Create a demo-large-files folder
- Initial a Git repo in this folder
- Create some demo folders and files
- Make an initial commit
- Create two branches
- Create two tags
- Add a remote
- Push everything to GitLab
- Delete everything locally

```sh
cd ~/Downloads
mkdir demo-large-files
cd demo-large-files

## Uncomment and run the following command to
## configure git to use a default of "main" instead of "master"
# git config --global init.defaultBranch main
## Alternatively, the following command can be used
## after initialization to rename the branch
# git branch -M main

git init

mkdir folder1 folder2
touch README.md data.csv folder1/file1 folder2/file2

git add -A
git commit -m 'Initial commit'

git branch develop
git branch patch-fix

git tag v1.0.0
git tag production

git remote add origin https://gitlab.com/egagne/demo-large-files.git

git push --set-upstream origin main

# Note that only the main branch was pushed
# You can confirm this at https://gitlab.com/egagne/demo-large-files/-/branches

git push --all

# Note that tags were not pushed
# You can confirm this at https://gitlab.com/egagne/demo-large-files/-/tags

git push --tags

cd ~/Downloads
rm -rf demo-large-files
```

## Create a mirror clone of the repo

In this section we do a mirror clone of the GitLab repo. Mirror clones are useful to pull down all branches, tags, and other repository objects so that you have the full repository.

The code below does the following
- git clone --mirror
- Changes the repo to non-bare. This is useful if we plan to push the repo to a new remote.
- We look at the file structure, branches, and tags
- Then we done a regular clone and see how it is different. Note that the tags will come over, but not the branches.
- Finally we delete everything locally

```sh
cd ~/Downloads
git clone --mirror https://gitlab.com/egagne/demo-large-files.git

ls -l demo-large-files.git

git -C demo-large-files.git config --get core.bare
git -C demo-large-files.git config --bool core.bare false

cd demo-large-files.git
git branch
git tag

cd ~/Downloads
git clone demo-large-files.git demo-large-files

cd demo-large-files
ls -l

git branch

git tag

cd ~/Downloads
rm -rf demo-large-files demo-large-files.git
```

## Pull down with all branches

Let's look at this again, but this time we will end up with a regular clone that includes all branches.

```sh
cd ~/Downloads
rm -rf demo-large-files
git clone https://gitlab.com/egagne/demo-large-files.git

git tag

git branch

for branch in $(git branch -r | grep -v '\->'); do
  git branch --track "${branch#origin/}" "$branch"
done

git branch

cd ~/Downloads
rm -rf demo-large-files
```

For the same result, here are steps that do a mirror clone, convert it to a non-bare repo, and then pull in all the branches

```sh
git clone --mirror https://gitlab.com/egagne/demo-large-files.git

git clone demo-large-files.git demo-large-files

cd demo-large-files

git tag
git branch

git remote -v

for branch in $(git branch -r | grep -v '\->'); do
  git branch --track "${branch#origin/}" "$branch"
done

git branch
```

## Create large files

OK, that's been fun, but let's move on to working with large files now. The code block does the following.

- Deletes anything still on the local file system
- Does a fresh regular clone from GitLab
- Pulls down all the branches
- Create two large (128mb) and two super large (2.1gb) files
- Commits the files
- Add GitHub as the remote origin
- Tries a push

Note that this will fail because GitHub (same is true for GitLab) has a max file size limit of 100mb.

```sh
rm -rf demo-large-files.git demo-large-files

cd ~/Downloads
git clone https://gitlab.com/egagne/demo-large-files.git
cd demo-large-files

for branch in $(git branch -r | grep -v '\->'); do
  git branch --track "${branch#origin/}" "$branch"
done

# add some large files and super large files
dd if=/dev/urandom of=file_a_128mb.data bs=1024 count=131072
dd if=/dev/urandom of=file_b_128mb.data bs=1024 count=131072
dd if=/dev/urandom of=file_a_2.1gb.data bs=1024 count=2202010
dd if=/dev/urandom of=file_b_2.1gb.data bs=1024 count=2202010

git add file_*
git commit -m 'large files added'

git remote -v

git remote set-url origin https://github.com/elijahgagne/demo-large-files.git

git push
```

## Install git lfs

Let's use the Git extension Large File Storage. Since I'm on a Mac, I can use the following commands to install it.

```sh
brew install git-lfs
git lfs install
```

More information is avialable at [https://git-lfs.com/](https://git-lfs.com/)

## Try to use git lfs when there are super large files

This code block demos the following

- Use the find command to locate all files >100mb
- Remove one large and one super large file
- Run a git garbage collection
- Import everything >100mb into LFS
- Try to push

Note that this is going to fail because my personal GitHub account cannot take super large files, even though they are managed by git lfs.

```sh
# Find files larger than 100mb
find . -type f -size +100M

git rm file_b_*
git commit -m 'removed one large and one super large file'

git lfs migrate import --everything --above=100Mb
git push --all origin
```

## Delete super big files using BFG Repo Cleaner

Alright, so LFS works for large files, but there are still limits imposed by the Git remote that might preclude super large files. Git isn't a place to store large data; it's really meant for storing code.

For this use case we need a way to remove the super large files from the Git repo. This is going to mean rewriting Git history. There is a `git filter-branch` command built into the command line binary to do this. But even [GitHub recommends](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository#purging-a-file-from-your-repositorys-history) that instead you consider using the open source tool called [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/).

Note that this tool/workflow might also be useful if you've accidently committed sensitive data to a repository. I'm of the opinion that if you put a password and encryption key in a repo, your best bet is to change that credential immediately because you might not be able to account for anyone else you pulled down your secrets. But that's a topic for a different post. Additionally, I'll add that if you want to overwrite the remotes history, that is possible with a `git push --force`

This code block demos the following

- Download the BFG jar file
- Then we remove everything from LFS
- Next, we delete the super large file from the working directory and then commit the change. This is needed because BFG, by design, will not delete files that exist in HEAD. It's documention explains that "your current files are sacred".
- We run `git log` so that we can have a listing of the commit ids
- Git garbage collection is run to pack the objects
- Now it's time to run BFG to delete the large files and then rewrite the git history
- Logs are written to a `..bfg-report` folder
- We then run `git log` again and note that some of the commit hashes have changed
- We try a push again, but it failes because of large files
- Next we import with LFS and push again, which works

```sh
cd ~/Downloads
curl -o https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

git lfs migrate export --everything --include="*"

git rm -f file_a_2.1gb.data
git add -A
git commit -m 'removed last super large file'

git log --pretty=format:"%h"

git gc

java -jar ~/Downloads/bfg-1.14.0.jar --strip-blobs-bigger-than 2G .
git reflog expire --expire=now --all
git gc --prune=now --aggressive

rm -rf ..bfg-report

git log --pretty=format:"%h"

git push --all origin

git lfs migrate import --everything --above=100Mb

git push --all origin

git push --tags
```

## Working with files in LFS

As a last piece, I wanted to explore how LFS works. The following code block shows:

- We clone a repo with files managed by LFS
- We check the size and structure of the cloned repo
- Then we run a `git lfs pull` and check again
- This shows that we've "hydrated" the files locally

```sh
cd ~/Downloads
rm -rf demo-large-files*

git clone https://github.com/elijahgagne/demo-large-files.git demo-large-files

cd demo-large-files

du -sh .
ls -lh
ls -lh .git/lfs

git lfs pull

du -sh .
ls -lh
ls -lh .git/lfs
```
