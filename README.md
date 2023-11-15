# CDK Neptune Example

# Prerequisites

- git
- awscli
- Nodejs 16.x
- AWS Account and locally configured AWS credential

# Setup

## Install dependencies

```bash
$ npm i -g aws-cdk@2.108.1
```

bootstrap project

```bash
$ cd infra
$ npm i
$ cdk bootstrap
```

## Config

open [**infra/config/dev.toml**](/infra/config/dev.toml) and fill the blow fields

- `vpc.id`: vpc id, if this value is not provided, cdk will create new one for you.

and copy the file to as `.toml`

```bash
$ cd infra
$ cp config/dev.toml .toml
```

## Deploy

```bash
$ cdk bootstrap
$ cdk deploy --require-approval never
```
