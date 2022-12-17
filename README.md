# plants-pollination-ui
Plants &amp; Pollination - OpenUI5 based UI

## Deployment
Git Clone

    git clone https://github.com/stopwhispering/plants-pollination-ui.git
    cd plants-pollination-ui

Create & Run Docker Container

    # dev
    docker compose -f ./docker-compose.base.yml -f ./docker-compose.dev.yml up --build --detach
    
    # prod
    docker compose -f ./docker-compose.base.yml -f ./docker-compose.prod.yml up --build --detach

Test (dev): Open in Browser - http://pollination.localhost