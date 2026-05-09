<p align="center">
    <br />
    <img src="https://raw.githubusercontent.com/D3W10/SneakrVault/refs/heads/main/public/logo.svg" alt="Logo" width="80" height="72">
    <h1 align="center">SneakrVault</h1>
    <h4 align="center">Organize your sneaker collection</h4>
    <p align="center">
        <a href="#about">About</a>
        ·
        <a href="https://github.com/D3W10/SneakrVault/releases">Releases</a>
        ·
        <a href="CONTRIBUTING.md">Contributing</a>
    </p>
</p>

&nbsp;

## Table of Contents

- [About](#about)
- [Deploy your own](#deploy-your-own)
- [Development](#development)
    - [Prerequisites](#prerequisites)
    - [Setup environment](#setup-environment)
    - [Project structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

&nbsp;

## About

SneakrVault is a self-hosted sneaker collection management web application that aims to help users manage and organize their sneaker collections. It was designed for people who want a good way to keep track of their all pairs, their locations or manage the collection between multiple people.

It provides a user-friendly interface for anyone to add new pairs plus an admininstrator dashboard to manage users, brands and locations. Some of the features include:
- Search pairs with multiple filters;
- Ability to create multiple accounts (including admin and guest accounts);
- Assign locations and owners to pairs, great when you have a shared collection;
- A system that allow users to pick sneakers for one another;
- Organize pairs into collections for better management.

## Deploy your own

SneakrVault is a self-hosted application so, in order to start using it, you need to deploy an instance of it yourself. Even with no development experience, you should be able to do it by following the steps. Note that you might need to create 3 accounts.

1. Go to [GitHub](https://github.com/) and create an account;
2. Go to [Vercel](https://vercel.com/) and create an account;
3. Go to [Convex](https://www.convex.dev/) and create an account;
4. Create a new project in Convex (you can choose any name you want);
5. On the top, switch from "Development (Cloud)" to "Production", making it switch from green to purple;
6. Click on the button below to deploy SneakrVault to Vercel;

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FD3W10%2FSneakrVault)

7. Make sure your GitHub account is selected on "Git Scope" and choose a repository name (make sure it is set to private);
8. Click on "Create" and let the process finish, if it fails do not worry and proceed to the next step;
9. Once the deployment is finished, head over to Vercel's main page, select the project you created and head to "Environment Variables", there you want to add the following variables:
    - **Key:** `SESSION_SECRET` <br />
      **Value:** Go to a website like [RandomKeygen](https://randomkeygen.com/encryption-key) and generate a 128 bit hexadecimal key, copy the AES-128 key and paste it as value <br />
      **Environments:** Production and Preview <br />
      **Sensitive:** Yes
    - **Key:** `CONVEX_URL` <br />
      **Value:** Back in Convex, head to the "Settings" tab, copy the Cloud URL and paste it as value <br />
      **Environments:** Production and Preview <br />
      **Sensitive:** No
    - **Key:** `CONVEX_DEPLOY_KEY` <br />
      **Value:** Also on Convex Settings, click on "Generate Production Deploy Key", give it a name, copy it and paste it as value <br />
      **Environments:** Production and Preview <br />
      **Sensitive:** Yes
    - **Key:** `CONVEX_SERVER_SECRET` <br />
      **Value:** Go back again to [RandomKeygen](https://randomkeygen.com/encryption-key) and generate another 128 bit hexadecimal key, copy the AES-128 key and paste it as value <br />
      **Environments:** Production and Preview <br />
      **Sensitive:** Yes

10. Before proceeding, head over to the Convex Settings again and go to the "Environment Variables" tab, add a new variable called `CONVEX_SERVER_SECRET` and paste in the same key as the one in Vercel;
11. Back in Vercel, make sure you have all the keys set and, on the sidebar, head over to Settings then Build and Deployment, there you want to find the "Build Command" field, turn on override and paste:
```bash
bunx convex deploy --cmd 'bun run build'
```
> [!IMPORTANT]
> Make sure the command is pasted exactly as it is, some devices may replace `'` with `‘` or `’` and the deployment will later fail!

12. Save your changes, leave settings back to the project overview and head over to the "Deployments" tab. Click on the three dots on the top right and select "Create Deployment", click on "main" and select "Deploy to Production";
13. Wait for the deployment to finish;
14. Open [init.json](https://github.com/D3W10/SneakrVault/blob/main/convex/init.json), copy the contents of the file by clicking on the "Copy" button next to "Raw" and head over to the "Data" tab on the Convex dashboard;
15. If the deployment was successful and you followed the steps correctly, you should see a list of tables on the side, click on the "users" table;
16. Press "Add" on the top right and replace the contents with the copied data, press "Save";
17. You're done! Head to the project overview on Vercel and tap on "Visit" to see your newly deployed app. This is the URL you'll use to access SneakrVault;
18. First thing you should do is change the credentials of the default account. Type "admin" for both username and password and log in;
19. Go to "Settings" on the top right, go to the "Users" tab and click on the pencil icon next to the only user in the list;
20. You may change the username, password and other settings according to your preferences, this will be your account to interact with the app (make sure you change your color for a better experience, just put a [hex color code](https://htmlcolorcodes.com/) in the field or a name of a color you like);

> [!CAUTION]
> It is **very important** that you change the password to anything other than the default and memorable just for you, otherwise **any attacker can easily guess the password and manipulate data without you knowing**!

21. Once you're done with the users, head to "Brands" and add all the brands you will need (you can come back here anytime you need to add more), just select one of the existing presets or create one of your own;
22. Head to "Locations" and add all the locations you store your sneakers (*optional* but useful to keep track where they're stored);
23. Once done you're now free to explore the app, start adding pairs and modify the configuration to tailor it to your needs.

**Other useful notes**

24. You're most likely to open the app on your mobile device, for that you can add a link to the app on your home screen. On iOS/iPadOS you do that by opening the website URL in Safari, go to "Share", select "Add to Home Screen" and then "Add". This will also make the app open in fullscreen mode;
25. In case you don't like the URL you got or plan to buy a *fancy* domain, on Vercel go to the "Domains" tab under the project overview, and edit the domain name to where your SneakrVault will be hosted.

## Development

The following instructions are for developers who want to run the project locally for testing purposes or contributing to the project.

### Prerequisites

- Bun (or any other JS runtime/package manager)
- Node.js 18+
- Convex CLI installed

### Setup environment

1. Clone the repository:
```bash
git clone https://github.com/D3W10/SneakrVault.git
cd SneakrVault
```
2. Install the dependencies:
```bash
bun install
```
3. Run the Convex CLI in dev mode:
```bash
bunx convex dev
```
4. Rename the `.env.local.example` file to `.env.local`;
5. Follow the instructions in the terminal to associate the local project with a Convex project. You can then stop the Convex CLI by pressing `Ctrl + C`;
6. Fill the rest of the required values in the `.env.local` file.
7. Run the app:
```bash
bun run dev
```

### Project structure

```
SneakrVault/
├── convex/               # Convex related files
├── public/               # Static assets publicly available
├── src/
│   ├── components/       # UI components of the app
│   ├── data/             # Contains data and session managers
│   ├── lib/              # Custom hooks and data types
│   ├── routes/           # Contains all pages of the app
│   ╰── styles.css        # Tailwind CSS styles
├── .env.local.example    # Required environment variables
╰── components.json       # shadcn/ui configuration
```

### Customize homepage order

The interface of the homepage is somewhat modular, each section is a block that can be reordered, removed and extended. All the available blocks are present in `src/components/blocks` and can be used in `src/routes/index.tsx`. You may create custom blocks under that folder for other things you may need.

## Contributing

If you have any ideas or issues and would like to contribute to SneakrVault, please check [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## License

SneakrVault is licensed under the [Mozilla Public License 2.0](LICENSE).