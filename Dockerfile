FROM node:20

# Copy the package.json and package-lock.json files

COPY creditor/package*.json ./

# Install the dependencies

RUN npm install

# Copy the rest of the application code

COPY creditor .

# Build the application

RUN npm run build

# Expose the port the app runs on

EXPOSE 80

# Serve the app

CMD ["npm", "run", "start", "--", "--port", "80"]
