const expect = require('chai').expect;
const fs = require('fs');
const shell = require('../utils/shell');
const editCompose = require('../utils/editCompose');

const testFolder = './test-files';

const buildCompose = `version: '3.4'
networks:
    network:
        driver: bridge
        ipam:
            config:
                -
                    subnet: 172.33.0.0/16
volumes:
    vpndnpdappnodeeth_data: {}
services:
    vpn.dnp.dappnode.eth:
        build: ./build
        image: 'vpn.dnp.dappnode.eth:0.1.21'
        container_name: FROM-DAppNodeCore-vpn.dnp.dappnode.eth
        privileged: true
        restart: always
        volumes:
            - '/var/run/docker.sock:/var/run/docker.sock'
            - '/etc/hostname:/etc/vpnname:ro'
            - '/usr/src/dappnode/config:/usr/src/app/config:ro'
            - '/lib/modules:/lib/modules:ro'
            - 'vpndnpdappnodeeth_data:/usr/src/app/secrets'
        ports:
            - '4500:4500/udp'
            - '500:500/udp'
        dns: 172.33.1.2
        networks:
            network:
                ipv4_address: 172.33.1.4`;

const targetCompose = `version: '3.4'
networks:
    network:
        driver: bridge
        ipam:
            config:
                -
                    subnet: 172.33.0.0/16
volumes:
    vpndnpdappnodeeth_data: {}
services:
    vpn.dnp.dappnode.eth:
        image: 'vpn.dnp.dappnode.eth:0.1.19'
        container_name: TO-DAppNodeCore-vpn.dnp.dappnode.eth
        privileged: true
        restart: always
        volumes:
            - '/var/run/docker.sock:/var/run/docker.sock'
            - '/etc/hostname:/etc/vpnname:ro'
            - '/usr/src/dappnode/config:/usr/src/app/config:ro'
            - '/lib/modules:/lib/modules:ro'
            - 'vpndnpdappnodeeth_data:/usr/src/app/secrets'
        ports:
            - '4500:4500/udp'
            - '500:500/udp'
        dns: 172.33.1.2
        networks:
            network:
                ipv4_address: 172.33.1.4`;

describe('Util: editCompose', () => {
  const dcFrom = `${testFolder}/dc-from.yml`;
  const dcTo = `${testFolder}/dc-to.yml`;
  before(async () => {
    await shell(`rm -rf ${testFolder}`);
    await shell(`mkdir -p ${testFolder}`);
    fs.writeFileSync(dcFrom, buildCompose);
    fs.writeFileSync(dcTo, targetCompose);
  });

  it('Should move the image to the new compose', () => {
    editCompose.moveImage(dcFrom, dcTo);
    const image = editCompose.getImage(dcTo);
    expect(image).to.equal('vpn.dnp.dappnode.eth:0.1.21');
  });

  after(async () => {
    await shell(`rm -rf ${testFolder}`);
  });
});
