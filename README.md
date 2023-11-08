![](https://img.shields.io/badge/project-find-your-nearest-store-green)
![](https://img.shields.io/badge/license-MIT-green/)
![](https://img.shields.io/badge/node%40latest-%3E%3D%206.0.0-brightgreen)

<h1 align="center">Find Your Nearest Store</h1>

<table align="center">
    <h4>Content</h4> •
    <a>About</a> •
    <a>Installation</a> •
    <a>Running the app</a> •
    <a>Test</a> •
    <a>Technologies</a> •
</table>

## About

This service aims to establish a solid and efficient integration with the Google Maps APIs in order to identify the nearest establishment from a given point of origin. All the data relating to the establishments in question will be stored and managed in a dedicated spreadsheet.

In addition, the service is able to calculate and display a detailed route between the point of origin and a destination point, thus offering precise navigation information and step-by-step guidance for the user.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test
```

## Technologies

To the back-end the following technologies were used:

• Node.js 18
• TypeScript
• Nest.js
• JWT
• Express
• Google Maps API
• Docker