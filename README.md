## Serverless REST Assignment - Distributed Systems.

__Name:__ Rundong Huang

__Demo:__ https://youtu.be/Qn576sLTFio

### Context.


Table item attributes:
+ MovieID - number  (Partition key)
+ Title - String
+ description-String
  watched-Boolean
  rating-INt

### App API endpoints.


+ POST /thing - add a new movie.
+ GET /thing/{partition-key}/ - Get all the movies.
+ GEtT/thing/{partition-key}?attributeX=value - Get the direct movie

### Features.

#### Translation persistence (if completed)

[ Explain briefly your solution to the translation persistence requirement - no code excerpts required. Show the structure of a table item that includes review translations, e.g.

MovieID - number  (Partition key)
Title - String
description-String
watched-Boolean
rating-INt
]

#### Custom L2 Construct (if completed)

[State briefly the infrastructure provisioned by your custom L2 construct. Show the structure of its input props object and list the public properties it exposes, e.g. taken from the Cognito lab,

Construct Input props object:
~~~
type AuthApiProps = {
 userPoolId: string;
 userPoolClientId: string;
}
~~~
Construct public properties
~~~
export class MyConstruct extends Construct {
 public  PropertyName: type
 etc.
~~~
 ]

