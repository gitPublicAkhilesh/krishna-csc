# Shri Krishna Mobile & CSC Seva Kendra

A bilingual, static React website for **श्री कृष्णा मोबाइल एवं जन सेवा केंद्र** in Malhanpar, Urwa Road, Gorakhpur.

## Run locally

From the `frontend` directory:

```bash
yarn install
yarn start
```

Create a production build with:

```bash
yarn build
```

The production output is written to `frontend/build/`.

## Updating notifications

1. Open `frontend/src/data/notifications.js`.
2. Add, edit, or deactivate a record. Each record supports `id`, `title`, `message`, `active`, `important`, `startDate`, and `expiryDate`.
3. Save the file and run `yarn build` again.
4. Publish the new `build/` output.

Notifications are maintained in the source file. There is no admin panel, database, or live API, so changes appear after the static site is rebuilt and published.

## Content notes

The site lists the services shown in the supplied source code and does not claim government authorization, guaranteed approval, shop hours, prices, or unconfirmed services. Contact links use +91 9621453345, and the supplied address is Malhanpar, Urwa Road, Gorakhpur, 273403, Uttar Pradesh.
