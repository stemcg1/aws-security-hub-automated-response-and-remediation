import {expect as expectCDK, haveResourceLike, ResourcePart, SynthUtils} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as TestStack from './test-stack';

function getTestStack(): cdk.Stack {
    const envEU  = { account: '2383838383', region: 'eu-west-1' };
    const app = new cdk.App();
    const stack = new TestStack.TestAssumeRole(app, 'MyTestStack', {env: envEU});
    return stack;
}

test('Test the playbook to have all the required resources.', () => {

    process.env.DIST_OUTPUT_BUCKET = 'solutions'
    process.env.DIST_SOLUTION_NAME = 'aws-security-hub-automated-response-and-remediation'
    process.env.DIST_VERSION = 'v1.0.0'

    expectCDK(getTestStack()).to(haveResourceLike("AWS::IAM::Role", {
        "AssumeRolePolicyDocument": {
            "Statement": [
                {
                  "Action": "sts:AssumeRole",
                  "Effect": "Allow",
                  "Principal": {
                    "AWS": {
                      "Fn::Join": [
                        "",
                        [
                          "arn:aws:iam::",
                          {
                            "Ref": "MasterAccountNumber"
                          },
                          ":role/SO0111_CIS24_lambdaRole"
                        ]
                      ]
                    }
                  }
                }
              ],
              "Version": "2012-10-17"
            },
            "Policies": [
              {
                "PolicyDocument": {
                  "Statement": [
                    {
                      "Action": "cloudtrail:UpdateTrail",
                      "Effect": "Allow",
                      "Resource": {
                        "Fn::Join": [
                          "",
                          [
                            "arn:aws:cloudtrail::",
                            {
                              "Ref": "AWS::AccountId"
                            },
                            ":*"
                          ]
                        ]
                      }
                    }
                  ],
                  "Version": "2012-10-17"
                },
                "PolicyName": "default_lambdaPolicy"
              }
            ],
            "RoleName": "SO0111_CIS24_memberRole"

    }, ResourcePart.Properties))
});
