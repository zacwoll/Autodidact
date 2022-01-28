# Autodidact
A webtool to help organize and develop self-study


## Hosting with Google Cloud
We're hosting 3 major applications within Google cloud and working on connecting them.

I am scaffolding a postgres instance inside google cloud that will be accessed by my backend server, that will pass information along to my frontend.

I am putting that backend server inside the same Google cloud network, a Virtual Private Network (VPC) provides networking functionality to:
- Compute Engine virtual machine (VM) instances
- Google Kubernetes Engine (GKE) clusters
- App Engine flexible environment.

### Quick Notes about the Google CLoud gcloud tool!
The primary CLI tool to create and manage Google cloud resources is called *gcloud*

[*gcloud reference*](https://cloud.google.com/sdk/gcloud/reference)

[*gcloud cheat sheet](https://cloud.google.com/sdk/docs/cheatsheet)

> The gcloud CLI manages authentication, local configuration, developer workflow, and interactions with the Google Cloud APIs.

Most gcloud commands follow the following format:

`gcloud + release level (optional) + component + entity + operation + positional args + flags`

### Google App Engine
Seems like Google App Engine is how you host applications like my backend.

> Build highly scalable applications on a fully managed serverless platform.

> Scale your applications from zero to planet scale without having to manage infrastructure

#### We'll go with the Flexible
The Flexible App Environment is going to be good for my needs, which are pricing based on usage and ran inside docker containers.

> When to choose the flexible environment
>
> Application instances run within Docker containers on Compute Engine virtual machines (VM).
>
> Applications that receive consistent traffic, experience regular traffic fluctuations, or meet the parameters for scaling up and down gradually.
>
> The flexible environment is optimal for applications with the following characteristics:
>
> - Source code that is written in a version of any of the supported programming languages:
> - Python, Java, Node.js, Go, Ruby, PHP, or .NET
>
> - Runs in a Docker container that includes a custom runtime or source code written in other programming languages.
>
> - Uses or depends on frameworks that include native code.
>
> - Accesses the resources or services of your Google Cloud project that reside in the Compute Engine network.

#### Vs. the Standard Environment
We're not going with the Standard

> When to choose the standard environment
> Application instances run in a sandbox, using the runtime environment of a supported language listed below.
>
> Applications that need to deal with rapid scaling.

> The standard environment is optimal for applications with the following characteristics:
>
> Source code is written in specific versions of the supported programming languages:
> - Python 2.7, Python 3.7, Python 3.8, Python 3.9
Java 8, Java 11
> - Node.js 10, Node.js 12, Node.js 14, Node.js 16
> - PHP 5.5, PHP 7.2, PHP 7.3, and PHP 7.4
> - Ruby 2.5, Ruby 2.6, and Ruby 2.7
> - Go 1.11, Go 1.12, Go 1.13, Go 1.14, Go 1.15, and Go 1.16
> - Intended to run for free or at very low cost, where you pay only for what you need and when you need it. For example, your application can scale to 0 instances when there is no traffic.
> - Experiences sudden and extreme spikes of traffic which require immediate scaling.

https://www.gstatic.com/bricks/image/319f10cf7f09f8df1bfebba76befca436212150f615375e3a4fd8d7968e69329.svg

## A map of what I'm saving and why

Linkify is a JS plugin that makes links written in markdown render as anchor tags
[Linkify Documentation](https://linkify.js.org/)

jstransformer-markdown-it, not sure yet how, but this is a resource that's been cited as the transformer from markdown to real tags.
[jstransformer-markdown-it documentation](https://www.npmjs.com/package/jstransformer-markdown-it)

### Google Documentation
Google's "One Tap" Sign in is complicated, and complex to set up, here's a list of the resources *avoiding* the "Sign in with Google" button that is being deprecated (!)

(!) Quote from the Google Sign-in JavaScript API site:
> We are discontinuing the Google Sign-In JavaScript Platform Library for web. For authentication and user sign-in, use the new Google Identity Services SDKs for both Web and Android instead.

For verification of the Google ID Token:
[verify google id token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)

An Overview of OpenID Connect, which uses OAuth 2.0 credentials, which is a very modern authentication protocol.
[OpenID Connect](https://developers.google.com/identity/protocols/oauth2/openid-connect#server-flow)

Remember OAuth 2.0? here's their documentation on the flow of OAuth they list it here as a series of steps
1. Configure the client object [link](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#creatingclient)
2. Redirect to Google's OAuth 2.0 server [link](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#redirecting)
3. Google prompts user for consent [link](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#userconsentprompt)
code samples are included, it's a lot to read through.
[OAuth 2.0](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#oauth-2.0-endpoints_1)

A deprecated version of a Google's Authorization, Google Sign-In for Websites, specifically about [Authenticating with a backend server, steps](https://developers.google.com/identity/sign-in/web/backend-auth)

A link to the postgres project google platform service
https://console.cloud.google.com/apis/credentials/consent/edit?project=postgres-test-337315

An interesting implementation of Google Authetication using nodejs, express, typescript, pug and Google API. I think this is using the more recent Google One Tap, and I'm observing the methods used to decode the JWT and authenticate the various tokens needed to get information from the user.
[Bizarrely, he uses screenshots over code blocks.](https://medium.com/@nischalshakya95/google-authentication-with-nodejs-express-typescript-pug-and-google-api-55bd36d384c5)
[This is the gist of his code](https://gist.github.com/nischalshakya95/38959cb5e5633db306ea6aaa4ad31152)

Now this last guy, references this article, and I'm still learning how he does this connection. I've almost got it, I understand that we need to generate an authentication url for the person who wants to make an account on the app. They go visit that page and answer yes to the consent to sign up. Then, the function will give me a POST request with some information, and redirect to an endpoint of my choosing. I want it to give me a POST request to my '/users' endpoint and then redirect to the /subjects endpoint
[uddeshjain's google one tap](https://dev.to/uddeshjain/authentication-with-google-in-nodejs-1op5)

Google's official gapi (that's google-api for laymen) has an official example using node
[googleapis](https://github.com/googleapis/google-api-nodejs-client/blob/main/samples/oauth2.js)

Useful Illustration on the sign in flow!
https://developers.google.com/identity/sign-in/web/server_side_code_flow.png

### The FrontEnd of my website!
Next time I run
```
git clone autodidact
gcloud app deploy
```
This will be a real hero with a log in!
[Frontend](https://postgres-test-337315.uc.r.appspot.com/)

### Pug Documentation
pug is a template renderer for express. Think 'jinja' for flask but for javascript. I can simply inject data into the template and render html webpages on request of the user. The entire frontend is built like this, you enter the application through
`autodidact.space/` and you're given the pug template for the homepage. It's neat because it *extends* the pug template for the layout. So since I use Bootstrap CDN on all my templates I can just place it in a template *layout* head and implement that layout on every page. If I had a navigation, this would be a *really* good place to put it!

Pug documentation is *really* good, so I'm going to include no less than 3 links here -
- [Template Inheritance](https://pugjs.org/language/inheritance.html), used for putting templates *in* templates
- [Filters](https://pugjs.org/language/filters.html), or how we're going to make markdown files render for the users! All of our notes are supposed to be stored in markdown, and should be rendered in some context
- [Comments](https://pugjs.org/language/comments.html), it turns out comments are a slightly more complex scenario in pug than it seems at first glance, there's comments that are in the rendered html, only in the files, conditionally rendered comments.

HTML to Pug converter, it's not hard to convert html to pug code, but it's certainly *VERY* nice to have a tool handy
[html-to-pug](https://html-to-pug.com/)

An Incredible guide to the pug template tool
[sitepoint's beginner's guide](https://www.sitepoint.com/a-beginners-guide-to-pug/)

My starting point! A sample application built with Node Express & pug, they used Auth0 to handle authentication, it's their blog hosting the article. This is where it breaks with my code, but this was an amazing starting point for my codebase using pug. This is where I got the idea to have this *layout* that gets *extended* I also learned how to configure [browsersync](https://browsersync.io/docs/options/), which is an amazing technology that syncs a server-side rendered application to a live webpage and reloads watching the files. This pairs really well with nodemon, which can run your express server app indefinitely, and also re-runs watching for changes in the files.

### Notes about Bootstrap for our new feature, a FrontEnd!
Breakpoint	Class infix	Dimensions
===
X-Small	None	<576px
Small	sm	≥576px
Medium	md	≥768px
Large	lg	≥992px
Extra large	xl	≥1200px
Extra extra large	xxl	≥1400px

Bootstrap template page! Come here and get inspired to make all of Autodidacts pages!
[Bootstrap template](https://getbootstrap.com/docs/5.1/examples/heroes/)

[The Bootstrap Documentation](https://getbootstrap.com/docs/5.0/content/typography/)
We're using Bootstrap to put together flexible containers for the UI of Autodidact!