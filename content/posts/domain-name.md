---
title: "Domain Name"
date: 2021-03-27
tags: ["blog"]
draft: false
---

It's well known in the computing world that [naming things is hard](https://martinfowler.com/bliki/TwoHardThings.html). In this case, I needed a domain name for my web identity. I've owned `elijahg.com` for 14+ years. Soon after my wife and I started a family, I realized that the `elijahg.com` domain really only worked for me and I wanted something that could be useful for my whole family.

So that obviously meant the first domain I looked into purchasing was `gagne.com`, taken. `gagne.net`, taken. How about one of those new domains. `gagne.tech` was available and I could buy it for 10 years on the cheap. The problem is that it seems after 10 years that price might be $50/year to renew. I didn't want to risk building an identity on something and then being on the hook for $50/year. So that pushed me back to `.com` and `.net` top level domains (TLD). Since I couldn't get exactly what I wanted from either of those TDLs, I figured I might as well stick with `.com`.

At this point, I've narrowed it down to gagneXYZ.com. Maybe `gagneweb.com`, but I want more than websites. Maybe `gagnehub.com`, that has an unattractive connotation. I settled on gagnenet.com. That last question is to hyphenate or not. I chose not to since I felt like it was unnecessarily giving the domain two TLDs.

OK, I've got a domain name that's available, where to register it. I registered `elijahg.com` at http://dnsexit.com/ and I've always been happy with them. However, besides a website, I also wanted a `something@gagnenet.com` email address. If you register with Google Domains they give you 100 free email aliases. Google has an article named [Forward your emails](https://support.google.com/domains/answer/3251241?hl=en) with the details. Basically you can take a `myaddress@gmail.com` and change it's default email address to be `something@customdomain.com`. The steps to convert your normal gmail.com account to use your custom domain are covered in the Google support link and should only take a few minutes to implement.

Sold! I bought `gagnenet.com` via [Google Domains](https://domains.google.com/), and followed the steps to setup email forwarding. Besides my own personal email address, I wanted to have a family mailing list and a "noreply" blackhole address that I could use to send out automated emails. I realized that all of these could simply forward to my personal gmail.com address and then I could create filter rules to do the appropriate thing depending on what address the email was originally sent to.

![google-domains](/domain-name/google-domains.png)

Great, domain, email, check. The last part to consider was around web hosting. I'd had some experience with Cloudflare and I decided to change my nameservers for `gagnenet.com` to them for the following reasons:
- If I wanted to proxy web traffic through Cloudflare for performance or security reasons, giving Cloudflare DNS management of the domains makes configuration seamless
- Cloudflare has a ton of additional features that might prove useful at some point
- Cloudflare has a more capable API than Google Domains if I wanted to dynamically update DNS

Changing the name servers over is super simple. Cloudflare and Google each have their own article explaining it from both angles:
- [Changing your domain nameservers to Cloudflare](https://support.cloudflare.com/hc/en-us/articles/205195708-Changing-your-domain-nameservers-to-Cloudflare)
- [Google: Manage domain name servers](https://support.google.com/domains/answer/3290309)

After switching the nameservers over to Cloudflare I had to add the relevant MX records to handle email forwarding (something Google Domains did automatically).

![cloudflare](/domain-name/cloudflare.png)

With that, I have my `.com`, DNS, and email setup for my custom domain. Total cost $12/year.
