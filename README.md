# STUPS Frontpage

This is the static site covering all of STUPS (STUPS to unleash penguin swarms) open source landscape. It consists of two parts, basically:

* The standard Jekyll setup
* The `bubbles.yml` file describing or projects and their relationship.

## Installation

Get Ruby on your system (`sudo apt-get install ruby ruby-dev` on Debian). Then do

    gem install jekyll therubyracer jekyll-less

You might need to use `sudo`, I don't know and neither do I care.

## Run the thing locally

    jekyll serve --watch

will generate the site and watch for changes, regenerating it as needed.

## Insert content

The plan is as follows: For every one of our projects there will be one post in `_posts` directory. The naming scheme has to be `:year-:month-:day-:title.md`. The date might describe when it was finished or when we started the project, that's up to you. Use this [YAML front matter](http://jekyllrb.com/docs/frontmatter/):

    ---
    layout: page
    title: "Mah title"
    image: "http://optional-image.com"
    ---

Then, when you did this, you need to update `bubbles.yml`. This file is used to generate our project graph. If not existing, please add the new project to the `nodes` section. You may specify a `type`. Nodes of the same type will have the same color. If it has relationships to others, add those to `node_links`, using the `id`s of nodes.

And, most importantly, add the newly generated link as `href` to the node!

    - name: "pierone"
      id: "pierone"
      aka: "Docker Registry" # this is currently unused
      href: "/docker-registry.html"

And also to the link, if available.

    - source: "pierone"
      target: "iam"
      href: "http://reddit.com"
