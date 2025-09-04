# AI Podcast Generator

## Description: A full-stack application to scrape the web for trending news articles, then generates podcast audio

### Motivation: I always find that I'm not up to date on current events, particularly because of the amount of "bloat" i have to deal with in order to keep up (like ads, unnecessary content on social media, biased viewpoints, etc). It always feels like I have to actively defend my focus while reading up on current events, which is excessively tiring. This project aims to do the searching for me, and present it to me in a way that makes it easy to digest but also with minimal bloat.

### I want to keep up with stuff like policy changes, world conflict, economic state, 

## Backend will be a microservices-based, event-driven architecture. Initially, it will just operate as a daily ran job that pushes generated podcasts to Spotify daily

1. job initiation API
    - takes incoming API requests to begin the content retrieval/podcast generation job loop
    - should ideally respond with a job UUID and SSE endpoint, in case I want to add a web interface
        - SSE endpoint is for web client to subscribe to - so that it can receive updates from the different microservices and maintain a "generation progress" bar
    - expected input: 
        - numArticles (int)
        - topic (string[])
        - source ('news', 'twitter', 'reddit')
    - function:
        1. generate job UUID and SSE endpoint, respond to the client with this request
        2. publish a message to the "content-retrieval" message queue with the following parameters
            - job UUID
            - SSE endpoint
            - numArticles to search
            - list of specific topics to search (initially will be everything but entertainment/sports)
            - voice preference (male, female, austrailian, english, etc)

2. content retrieval service
    - subscribes to a "content-retrieval" message queue
    - should be written in typescript, because typescript is the native language for playwright
    - expected input:
        - job UUID (for error tracking)
        - SSE endpoint (to send updates)
        - numArticles to search (int)
        - list of specific topics to search (string[])
    - function:
        1. first make an api call to newsapi.org, pulling news articles of the desired quantity and topic
        2. for each article, check microservice DB for existing data. otherwise, access and scrape the content using playwright
            - store url and content, to avoid redundant content scraping
            - form an array of objects, which should take the form
            - articles: [
                {
                    url: string
                    name: string
                    description: string
                    content: string
                },
                ...,
                { ... }
            ]
        3. publish a message to the "content-summary" message queue with the following parameters
            - job UUID
            - SSE endpoint
            - array of article content

3. llm summary service
    - subscribes to "content-summary" message queue
    - expected input:
        - job UUID
        - SSE endpoint
        - array of article CONTENT

4. llm transcription service
    - subscribes to "transcript-generation" message queue
    - expected input: 
        - job UUID
        - SSE endpoint
        - list of article SUMMARIES

5. audio generation service

6. podcast publishing services
