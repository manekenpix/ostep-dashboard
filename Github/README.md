### Dev Run

`npm start`

### Docker

`docker build -t github-api .`

`docker run --env-file=token.env -p 8086:2006 -d github-api`

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/Seneca-CDOT/ostep-dashboard/blob/dashboard/GITHUB_API/LICENSE) file for details.

## Open Source Software Used

Node.JS + npm packages

## Instructions

### Create a token.env file local to service.js

Add this code: 

GITHUB_TOKEN="PLACEHOLDER"

Note: This key is called from the backend, so it should not be available to the public.
