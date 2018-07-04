# ticket

A ticketing system on distrubuted ledger technology

## Features

- Manage ticket via chatbot
- Use distrubuted transaction as underlying datastore for trust

## Phase I

- All events are free
- Stellar accounts are managed by the system (using federation server)
- One Crypto Token per event
- Use `CAT` as an exchange token to ticket token
- Chat flatform: `Facebook` and `Line`

### Tasks

- Chat bot
  - [ ] `Organizer` able to create an event
  - [ ] (optional) `Organizer` able to manage created event
  - [ ] `Attendee` able to view events
  - [ ] `Attendee` able to book an event (get a ticket)
  - [ ] `Attendee` able to view the booked event
  - [ ] (optinal) `Attendee` able to manage the booked event
- Ticketing system
  - [ ] Books event on `Facebook`
  - [ ] Sends confirmation via `email` (mailgun), with the following in the attachment: `ics` file, `QR` code
- Stellar
  - [ ] Creates on Crypto token per event: `Name`, `Limit`, `Code`
  - [ ] One token per ticket
  - [ ] Use `Bridge Server` as API endpoints, including internal API and Hyperledger federation
  - [ ] Maps user account on `Federation Server`
  - [ ] Uses `CAT` coin as exchanging asset to ticket token
  - [ ] Booking ticket operations
  - [ ] Using ticket operations
  - [ ] (optional) Managing ticket operations
- Reception (at venue)
  - [ ] Scan `QR` code to confirm using the ticket
