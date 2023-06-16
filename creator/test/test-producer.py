from kafka_setup.kafka_producer import KafkaProducer


producer = KafkaProducer(
    topic='chart-data',
    bootstrap_servers='localhost:9092'
)

producer.send(
    value={"imgUrl": "Dominique", "chartType": "de Coco"}
)

producer.close() # much needed for accumulator
