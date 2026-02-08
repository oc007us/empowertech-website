#!/bin/bash
npm run build
touch docs/.nojekyll
git add .
git add docs/.nojekyll
