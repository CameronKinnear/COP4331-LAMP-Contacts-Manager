# Bruno API runners

Open this directory as a Bruno collection. The `Auth` folder logs in and checks the health endpoint; run its requests in order. The `Contacts` folder then lists, searches, creates, and updates a contact. The create request stores its returned ID in the runtime `contactId` variable for the update request.

The `Admin` folder is a separate authenticated sequence. Log in with an active admin account, then list/search users and inspect contacts. Admin and regular-user runs share Bruno's cookie jar, so run the appropriate login first if you switch roles.

## Local setup

Edit the `Local` environment values for your server URL and API path. Create the configured regular and admin accounts through the app or database before running the matching folder. Set `adminUserId` to a user ID that exists when exercising admin contact listing. Enable cookie handling in Bruno: the API authenticates with PHP sessions.

The API currently has no contact DELETE route, so the collection covers all implemented contact operations (list, search, create, update). The test contact uses a fixed email/name; remove it manually from the database if you need a clean rerun.
