#!/bin/bash

set -euxo pipefail

source /etc/profile
source ~/.profile
cd /app/
pnpm refresh-webhooks &> /var/log/cron.log
