
docker pull rabbitmq

docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 -p 1883:1883 rabbitmq