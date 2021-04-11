---
title: "Website hosting"
date: 2021-04-10
tags: ["blog"]
draft: false
---

At this point I have the `gagnenet.com` domain and I'd like to find hosting for https://gagnenet.com/. Let's outline some of the requirements I have:

- $0 cost is highly desirable
- Easy HTTPS certificate management is a plus
- Publishing new content should be simple

There are two hosting providers I've tinkered around with in the past that I decided to explore further.

The first is [GitHub Pages](https://pages.github.com/). It's free and publishing new content is simple. It works by creating a GitHub repository and pushing content up. In the most basic example, you create HTML/CSS/JavaScript content locally do a `git push` to publish your website updates. They also have integration with a static site generater called [Jekyll](https://jekyllrb.com/). Making use of the integration, you can create content in [markdown](https://www.markdownguide.org/getting-started/) and push that to the Git repo. After that, GitHub runs Jekyll on their platform to build your website from the markdown. GitHub Pages does let you choose a custom domain, but they do not offer HTTPS built in. To accomplish that, we can introduce [Cloudflare as a proxy](https://blog.cloudflare.com/secure-and-fast-github-pages-with-cloudflare/). This great because Cloudflare has built in support for using [Let's Encrypt](https://letsencrypt.org/) so it will handle creating and updating the certificates for you.

For me, the downside is Jekyll. There are players in the static site generator field that I am familiar with: Jekyll and [Hugo](https://gohugo.io/). Jekyll is based on Ruby, while Hugo is written in Go. Jekyll is said to be easier for beginners and has better themes. Hugo is known to be super fast (sometimes 35x faster than Jekyll) and has more built in features. Speed of deployment shouldn't be a factor for me since I don't expect a big site, but I couldn't ignore how nice it was to press `Cmd-S` to save a file and `Cmd-Tab` to switch to my browser and see my content updated in a fraction of a second.

So Hugo it is. I could still use Hugo with GitHub Pages, but there is no built in integration. What this means is that I would run Hugo locally, let it produce the static content, and then push that static content up to GitHub. Not terrible, but not really what I wanted if I could avoid it.

With that limitation, I looked at my second hosting provider: [Netlify](https://netlify.com/). Looking on their pricing page, the starter plan for $0 gives me everything I need to build a small personal blog. Now that I've explained how I arrived at my decision, let me walk through the steps to get everything setup.

At a high-level, I need to do the following:

1. Create an empty GitHub repo
2. Install Hugo and create a website
3. Configure Netlify for continuous deployment

## 1. Create an empty GitHub repo

```sh
mkdir blog
cd blog
touch README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:elijahgagne/blog.git
git push -u origin main
```

## 2. Install Hugo and create a website

Following the [Hugo Quick Start guide](https://gohugo.io/getting-started/quick-start/), on my Mac I use [Brew](https://brew.sh/) to install Hugo.

```sh
brew install hugo
```

Once I have Hugo, I use it to create a new site. Since I'm already in the `blog` directory, I use `.` to reference the current directory. I also use `-f yml` to specify that want to format my configuration in [YAML](https://www.cloudbees.com/blog/yaml-tutorial-everything-you-need-get-started/) (the default is [TOML](https://toml.io/en/)).

```sh
hugo new site . -f yml
```

Let's install a theme. After a tremendous amount of experimenting, I settled on [PaperMod](https://themes.gohugo.io/hugo-papermod/). My reasons for picking it is that it's being actively maintained, has a lot of useful features, and it has really good documentation on it's [GitHub repo](https://github.com/adityatelange/hugo-PaperMod). I chose to use installation option #2 in it's [install guide](https://adityatelange.github.io/hugo-PaperMod/posts/papermod/papermod-installation/).

```sh
git submodule add https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod --depth=1
git submodule update --init --recursive
```

Let's do some basic configuration and create a hello world post. I launch VS Code and then run a command to create a new page.

```sh
# Set the theme
echo 'theme: PaperMod' >> config.yml

# Open the current directory in Visual Studio Code
code .

# Create a post
hugo new posts/first-post.md
```

I can then start the Hugo development server and view my site by browsing to http://localhost:1313/.

```sh
hugo serve -D
```

## 3. Configure Netlify for continuous deployment


