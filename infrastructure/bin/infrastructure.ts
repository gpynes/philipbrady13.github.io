#!/usr/bin/env node
import 'source-map-support/register'
import { STS } from 'aws-sdk'
import * as cdk from '@aws-cdk/core'
import { ChromeCastStack } from '../lib/chrome-cast-stack'

const app = new cdk.App()

const main = async () => {
  const { Account = '' } = await getProfileCredentials()

  const bucketName = getBucketNameFromAccountId(Account)
  const originAccessIdName = getOAIFromAccountId(Account)

  new ChromeCastStack(app, 'ChromeCastStack', {
    bucketName,
    originAccessIdName,
    rootFile: 'index.html',
  })
}

main()

function getBucketNameFromAccountId(id: string) {
  switch (id) {
    case '007783735049':
      return 'chromecast.mediazilla.com'
    case '238138294568':
      return 'chromecast.staging.mediazilla.com'
    default:
      return 'chromecast.development.mediazilla.com'
  }
}

function getOAIFromAccountId(id: string) {
  switch (id) {
    case '007783735049': // prod
      return 'E17PBAG4M6PD4T'
    case '238138294568': // staging
      return 'E3AN87SPQG9ZE8'
    default:
      return 'E34T19MGRH5YMZ'
  }
}

export async function getProfileCredentials() {
  const sts = new STS()

  const identity = await sts.getCallerIdentity().promise()
  return identity
}
