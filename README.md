# Restaurant Management API - Seeding Information

This document provides details on how to seed the database and the credentials for the created venue users.

## Prerequisites

- Node.js (Check package.json for recommended version, e.g., v22.4.1)
- npm
- MongoDB instance (update connection URI in scripts if needed)

## Setup

1. Clone the repository.
2. Navigate to the project directory: `cd TraceVenue-API`
3. Install dependencies: `npm install`

## Seeding Steps

1.  **Seed Restaurants:**
    -   Run the script: `node scripts/addRestautant.js`
    -   This will populate the `restaurants` collection with sample data.

2.  **Seed Users and Associate with Restaurants:**
    -   Run the script: `node scripts/associateUserToRestaurant.js`
    -   This creates a user for each venue, with each user associated with exactly one venue.

## Venue User Credentials

The following venue users have been created. You can use their email and password to log in.

**Important Security Note:** Passwords listed here are for initial setup and testing ONLY. In a real application, NEVER store or expose plain text passwords. The script hashes passwords before storing them in the database.

| User Name   | Email              | Password    | Associated Venue (Name) | Associated Venue (ID) |
|-------------|--------------------|-------------|-------------------------|------------------------|
| Sindhi Sweets Admin | venue10@example.com | (previously set) | Sindhi Sweets           | 6818aa2160c1ed42e9866302 |
| Sethi Dhaba Admin | venue11@example.com | (previously set) | Sethi Dhaba             | 6818aa2160c1ed42e9866308 |
| Domino's Pizza Admin | venue12@example.com | (previously set) | Domino's Pizza          | 6818aa2160c1ed42e986630a |
| Boston Bites Admin | venue13@example.com | (previously set) | Boston Bites            | 6818aa2160c1ed42e9866301 |
| Peddler's Admin | venue14@example.com | (previously set) | Peddler's               | 6818aa2160c1ed42e9866304 |
| Katani Dhaba Admin | venue15@example.com | (previously set) | Katani Dhaba            | 6818aa2160c1ed42e9866305 |
| Pyramid Cafe Lounge Bar Admin | venue16@example.com | (previously set) | Pyramid Cafe Lounge Bar | 6818bbc42a50ceac425dfc6e |
| Haveli Heritage Admin | venue17@example.com | (previously set) | Haveli Heritage         | 6818bbc42a50ceac425dfc73 |
| Sethi Dhaba Admin | venue18@example.com | (previously set) | Sethi Dhaba             | 6818bbc42a50ceac425dfc6f |
| Nik Baker's Admin | venue19@example.com | (previously set) | Nik Baker's             | 6818bbc42a50ceac425dfc72 |
| Pal Dhaba (Placeholder) Admin | venue1@example.com | (previously set) | Pal Dhaba (Placeholder) | 6818aa2160c1ed42e986630e |
| Barbeque Nation - Mohali Admin | venue20@example.com | (previously set) | Barbeque Nation - Mohali | 6818bbc42a50ceac425dfc67 |
| Amrik Sukhdev Dhaba (Placeholder) Admin | venue21@example.com | (previously set) | Amrik Sukhdev Dhaba (Placeholder) | 6818bbc42a50ceac425dfc74 |
| Sindhi Sweets Admin | venue22@example.com | (previously set) | Sindhi Sweets           | 6818bbc42a50ceac425dfc69 |
| Pal Dhaba (Placeholder) Admin | venue23@example.com | (previously set) | Pal Dhaba (Placeholder) | 6818bbc42a50ceac425dfc75 |
| Nagpal Pure Veg Foods Admin | venue24@example.com | (previously set) | Nagpal Pure Veg Foods   | 6818bbc42a50ceac425dfc70 |
| Katani Dhaba Admin | venue25@example.com | (previously set) | Katani Dhaba            | 6818bbc42a50ceac425dfc6c |
| Boston Bites Admin | venue26@example.com | (previously set) | Boston Bites            | 6818bbc42a50ceac425dfc68 |
| Domino's Pizza Admin | venue27@example.com | (previously set) | Domino's Pizza          | 6818bbc42a50ceac425dfc71 |
| The Brew Estate Mohali Admin | venue28@example.com | (previously set) | The Brew Estate Mohali  | 6818bbc42a50ceac425dfc6d |
| Stage Admin | venue29@example.com | (previously set) | Stage                   | 6818bbc42a50ceac425dfc6a |
| Pyramid Cafe Lounge Bar Admin | venue2@example.com | (previously set) | Pyramid Cafe Lounge Bar | 6818aa2160c1ed42e9866307 |
| Indian Coffee House Admin | venue30@example.com | (previously set) | Indian Coffee House     | 682479baae33b3244ac53805 |
| Backpackers Cafe Admin | venue31@example.com | (previously set) | Backpackers Cafe        | 682479baae33b3244ac53806 |
| Virgin Courtyard Admin | venue32@example.com | (previously set) | Virgin Courtyard        | 682479baae33b3244ac53807 |
| Swagath Restaurant & Bar Admin | venue33@example.com | (previously set) | Swagath Restaurant & Bar | 682479baae33b3244ac53808 |
| Gopal Sweets Admin | venue34@example.com | (previously set) | Gopal Sweets            | 682479baae33b3244ac53809 |
| Whistling Duck Admin | venue35@example.com | (previously set) | Whistling Duck          | 682479baae33b3244ac5380a |
| The Brew Estate Mohali Admin | venue3@example.com | (previously set) | The Brew Estate Mohali  | 6818aa2160c1ed42e9866306 |
| Nik Baker's Admin | venue4@example.com | (previously set) | Nik Baker's             | 6818aa2160c1ed42e986630b |
| Amrik Sukhdev Dhaba (Placeholder) Admin | venue5@example.com | (previously set) | Amrik Sukhdev Dhaba (Placeholder) | 6818aa2160c1ed42e986630d |
| Haveli Heritage Admin | venue6@example.com | (previously set) | Haveli Heritage         | 6818aa2160c1ed42e986630c |
| Stage Admin | venue7@example.com | (previously set) | Stage                   | 6818aa2160c1ed42e9866303 |
| Nagpal Pure Veg Foods Admin | venue8@example.com | (previously set) | Nagpal Pure Veg Foods   | 6818aa2160c1ed42e9866309 |
| Barbeque Nation - Mohali Admin | venue9@example.com | (previously set) | Barbeque Nation - Mohali | 6818aa2160c1ed42e9866300 |
