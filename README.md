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