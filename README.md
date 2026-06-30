# ORPHEUS AIRLINES

This is my portfolio site which showcases the projects that I make.

## How it works
- The repos with ".taxi" file in root, i.e. the projects that I'm working on right-now or the ones that are in progress, come under "Taxi" tab. [Taxi↗](https://en.wikipedia.org/wiki/Taxiing)
- The repos with ".holding-short" file in root, i.e. the projects that I'm yet to complete/ship come under the "Holding-Short" tab. [Holding-Short↗](https://en.wikipedia.org/wiki/Land_and_hold_short_operations)
- The repos with ".airborne" file in the root, i.e. the projects that I've completed/shipped come  under "Airborne" tab. [Airborne↗](https://www.thefreedictionary.com/airborne) 

## Steps to run this locally

```bash
git clone https://github.com/s-ajay-2010/orpheus-airlines.git
cd orpheus-airlines/taxi
cp .env.example .env # add your own env variables:)
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/)
### Important information to do before using
- Change the github repo link and the domain of your site in all branches
- Use ```git switch {branch name}``` to switch to the branches and use ```git branch -a``` to see the branches available.
- Add the respective markers to the repo's root.

# AI Usage:
- For UI development claude was used, other than that all logic was written by human(me).
- But I made the core design and let claude refine it and make it alive.
- For the proof of my design-originality, please check [here↗](https://github.com/s-ajay-2010/orpheus-airlines/tree/main/media)(the same things can be seen in my [development-branch↗](https://github.com/s-ajay-2010/orpheus-airlines/tree/development) where I write the whole thing, battle css to get an original design)