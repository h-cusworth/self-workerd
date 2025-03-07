# Self-hosted workerd using K8

This is based on [this repo](https://github.com/giuseppelt/self-workerd/tree/master).

It has been altered so that the worker and publisher containers will run in kubernetes. The restarting of the workers is no longer triggered in the call to the publishers `/publish` endpoint.

## Running locally with Minikube & Podman

1. Configure minikube to work with podman:
    `minikube config set driver podman`
    `minikube start --container-runtime=crio`
2. Build the container images:
    `podman build . --file publisher/Dockerfile -t publisher`
    `podman image save publisher -o publisher.img`
    `minikube image load worker.img`

    `podman build . --file worker/Dockerfile -t worker`
    `podman image save worker -o worker.img`
    `minikube image load worker.img`
3. Deploy to minikube:
    `kubectl apply -f worker-poc.yaml`

## Demo
- Upon starting up the workers pull their config file from the publisher and serve it on 8080.
- Each worker can be called on their corresponding endpoint`
- The publisher runs on port 3000 and can receive new/updated worker code.
- See example in the postman collection

```
{
    "name": "test1",
    "module": "export default { fetch(){ return new Response(JSON.stringify({ message: 'Hello world from Func1' })); }}"
}
```

To connect to the minikube cluster, apply portforwarding:
`kubectl port-forward svc/publisher-service 3000:3000`
`kubectl port-forward svc/worker-service 8080:8080`

## Restarting the Workers
- After posting a new worker to the publisher, the workers must be restarted:
    `kubectl rollout restart deployment worker-deployment`
- The publisher has an externally mounted volume, so any published code will persist even after a publisher restart: