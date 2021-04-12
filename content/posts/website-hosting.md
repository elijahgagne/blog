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

On GitHub, click `New` next to repositories.

![github-new](/website-hosting/github-new.png)

Then name your repository, in this case I chose `blog` and set whether it is public or private.

![github-name-repo](/website-hosting/github-name-repo.png)

After that, create the file structure locally and push your initial commit.

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

![hugo-serve](/website-hosting/hugo-serve.png)

## 3. Configure Netlify for continuous deployment

Now that we can view our site locally, let's create a place for us to deploy it and setup a pipeline automate the build/deployment. Create a free account with Netlify and then login in. Next, click `New site from Git`.

![netlify-new](/website-hosting/netlify-new.png)

Choose `GitHub`

![netlify-github](/website-hosting/netlify-github.png)

Click `Configure Netlify on GitHub`

![netlify-config-on-github](/website-hosting/netlify-config-on-github.png)

You may be prompted by GitHub to choose the account you wish to install Netlify on.

![github-choose-account](/website-hosting/github-choose-account.png)

Grant Netlify access only to the repo you're using for this website. You will likely be asked by GitHub to enter your password to confirm.

![github-netlify-permissions](/website-hosting/github-netlify-permissions.png)

Back in Netlify, click the repository you previously selected to continue.

![netlify-click-repo](/website-hosting/netlify-click-repo.png)

On the site settings step, leave all the defaults and click `Deploy site`.

![netlify-click-deploy-site](/website-hosting/netlify-click-deploy-site.png)

Click `2 Setup custom domain` to move on to the next step.

![netlify-click-custom-domain](/website-hosting/netlify-click-custom-domain.png)

Set your custom domain, in my case it was `gagnenet.com`.

![netlify-specify-domain](/website-hosting/netlify-specify-domain.png)

If prompted that the domain already has an owner, click `Yes, add domain`.

![netlify-click-add-domain](/website-hosting/netlify-click-add-domain.png)

Back on the custom domain configuration page, edit the default subdomain.

![netlify-edit-subdomain](/website-hosting/netlify-edit-subdomain.png)

I chose `gagnenet.netlify.app`.

![netlify-change-site-name](/website-hosting/netlify-change-site-name.png)

Now head over to Cloudflare and create CNAMES. In my case I created two:
- gagnenet.com -> gagnenet.netlify.app
- <span>www.</span>gagnenet.com -> gagnenet.netlify.app

Note that you're only creating DNS records and not proxying web traffic. Netlify has an [article](https://www.netlify.com/blog/2017/03/28/why-you-dont-need-cloudflare-with-netlify/) explaining why they do not recommend using Cloudflare as a proxy in front of Netlify.

![cloudflare-cname](/website-hosting/cloudflare-cname.png)

With DNS setup, you can now configure Netlify to automatically provision Let's Encrypt certificates for you. On the left, under `Domain management` click `HTTPS`. Then click `Verify DNS configuration`.

![netlify-verify-dns](/website-hosting/netlify-verify-dns.png)

Assuming verification was successful, click `Provision certificate`.

![netlify-provision-certificate](/website-hosting/netlify-provision-certificate.png)

Click `Provision certificate` in the module pane.

![netlify-provision-certificate2](/website-hosting/netlify-provision-certificate2.png)

And here's what it looks like when it's all setup.

![netlify-https-done](/website-hosting/netlify-https-done.png)

Switch back to the deploy tab of Netlify. Then generate some content, commit/push it to GitHub, and watch a build/deploy kick off. Netlify let's you specify the build configuration through it's web interface. However, I prefer to keep it in the Git repo. To do that, you can create a `netlify.toml` file in the root of the repo. Here's what mine looks like:

```sh
cat << 'EOF' > netlify.toml
[build]
publish = "public"
command = "hugo --gc --minify"

[context.production.environment]
HUGO_VERSION = "0.82.0"
HUGO_ENV = "production"
HUGO_ENABLEGITINFO = "true"
EOF
```

![netlify-deploy](/website-hosting/netlify-deploy.png)

It's now time to browse to your website and see if it worked.

![gagnenet-done](/website-hosting/gagnenet-done.png)
