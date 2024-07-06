npm run build

npm unpublish @angular-architects/ngrx-hateoas --force --registry http://localhost:4873/
npm publish dist/ngrx-hateoas --registry http://localhost:4873/
