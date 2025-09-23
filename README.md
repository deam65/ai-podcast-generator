# AI Podcast Generator

Description: A full-stack application to scrape the web for trending news articles, then generates podcast audio

Motivation: I always find that I'm not up to date on current events, particularly because of the amount of "bloat" i have to deal with in order to keep up (like ads, unnecessary content on social media, biased viewpoints, etc). It always feels like I have to actively defend my focus while reading up on current events, which is excessively tiring. This project aims to do the searching for me, and present it to me in a way that makes it easy to digest but also with minimal bloat.

I want to keep up with stuff like policy changes, world conflict, economic state, etc., without having to go through all this other stuff.

##### Backend will be a microservices-based, event-driven architecture. Initially, it will just operate as a daily ran job that saves specific-topic podcasts to cloud storage that I can access from my laptop/phone

##### However, I will eventually want to expand it to a web client that allows users to:
1. select the category they want to generate a podcast for
2. select the specific voice they want to hear


### Microservices
1. job initiation API
    - takes incoming API requests to begin the content retrieval/podcast generation job loop
    - should ideally respond with a job UUID and SSE endpoint, in case I want to add a web interface
        - SSE endpoint is for web client to subscribe to - so that it can receive updates from the different microservices and maintain a "generation progress" bar
    - expected input from REST API entry point: 
        - topic (string[])
        - source ('news', 'twitter', 'reddit')
    - function:
        1. generate job UUID and SSE endpoint, respond to the client with this request
        2. publish a message to the "content-retrieval" message queue with the following parameters
            - job UUID
            - SSE endpoint
            - list of specific categories to search (initially will be everything but entertainment/sports)
            - voice preference (male, female, austrailian, english, etc)

2. content retrieval service
    - subscribes to a "content-retrieval" message queue
    - expected body after parsing message data payload: 
        - job UUID (for error tracking)
        - SSE endpoint (to send updates)
        - list of specific categories to search (string[])
    - function:
        1. first make an api call to newsapi.org, pulling news articles of the desired quantity and topic
        2. for each article, check microservice DB for existing data to avoid redundant data pulling
            - we'll want to pull multiple articles from several "opinionated" sources, primarily because one source could be too biased/uninformed on the topic. I want to be as informed as possible
        3. publish a message to the "content-summary" message queue with the following parameters
            - job UUID
            - SSE endpoint
            - array of article content

3. llm summary service
    - subscribes to "content-summary" message queue
    - expected body after parsing message data payload: 
        - job UUID
        - SSE endpoint
        - array of article CONTENT

4. llm transcription service
    - subscribes to "transcript-generation" message queue
    - expected body after parsing message data payload: 
        - job UUID
        - SSE endpoint
        - list of article SUMMARIES

5. audio generation service

6. podcast publishing services

7. sse service
    - subscribes to "sse-updates" message queue
    - expected body after parsing message data payload: 
        - job uuid: string
        - SSE endpoint: string
        - progress percentage: int
        - originating service: string
    - function:
        1. send request to SSE endpoint URL