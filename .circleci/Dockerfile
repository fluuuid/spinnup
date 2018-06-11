FROM circleci/node:9.4.0
RUN \
  sudo apt-get update && \
  sudo apt-get install -y python python-dev python-pip python-virtualenv && \
  sudo rm -rf /var/lib/apt/lists/*

RUN \
  sudo pip install awsebcli && \
  sudo pip install awscli

RUN \
  sudo pip install --upgrade awsebcli && \
  sudo pip install --upgrade awscli
