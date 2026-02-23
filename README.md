# n8n-nodes-dropinblog

This is an n8n community node. It lets you use [DropInBlog](https://dropinblog.com) in your n8n workflows.

DropInBlog is an SEO-friendly blog solution that embeds into any website.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### DropInBlog Node

- **Post**
  - **Create** - Create a new blog post with title, content, and optional fields:
    - Status
    - Slug
    - Featured image URL
    - SEO title and description
    - Keyword
    - Author name
    - Category names
  - **Get** - Retrieve a post by its numeric ID or slug
  - **Search** - Search blog posts with optional filters:
    - Status (Draft/Published)
    - Limit

### DropInBlog Trigger Node

- **Post Published** - Triggers when a post is published in your DropInBlog

## Credentials

This node uses OAuth2 authentication with DropInBlog. You'll need to:

1. Contact [DropInBlog support](https://dropinblog.com/contact/) to request OAuth credentials for your account
2. Configure the OAuth2 credentials in n8n with the Client ID and Client Secret provided
3. Complete the OAuth authorization flow

## Compatibility

Tested with n8n version 1.48.0 and above. Requires Node.js 18.10 or later.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [DropInBlog API documentation](https://dropinblog.readme.io/reference/api-reference)
* [DropInBlog website](https://dropinblog.com)
