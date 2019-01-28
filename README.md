# dappnode-watchgit

Watches a git repository of a DNP and builds it again when it detects changes

## Methodology

Calls the commits endpoint of the github API to retrieve the latest commit

```
https://api.github.com/repos/dappnode/DNP_VPN/commits/open_ports_script
```

If there is a change in the commit sha, it builds the project again.
