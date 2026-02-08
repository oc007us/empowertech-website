#!/bin/bash
npm run build
touch docs/.nojekyll
git add .
git add docs/.nojekyll
git commit -m "Marketing website for Empower AI"
git push
