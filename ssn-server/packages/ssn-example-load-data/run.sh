# When restarting, clean the matrix profile queue folder
cd ../../../matrix-profile-service
rm -rf queue && mkdir queue
rm -rf pickles && mkdir pickles

cd ../ssn-server/packages/ssn-example-load-data/parkings
node index.js
