# News

Webscraping using queues and mongodb. This project is in the early stages. 

### Datasets

You can find the complete dataset in [Kaggle](https://www.kaggle.com/fogelman/brazilian-news)
### Requirements
```
nodejs 12.x
docker run -it -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
docker run -d -p 27017:27017 --name mongodb mongo
```
