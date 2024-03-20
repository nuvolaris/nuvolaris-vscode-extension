if test -n "$NUV_ROOT"
then echo "warning: NUV_ROOT set - you are using your own olaris"
fi

if test -z "$NUVDEV_FORCE"
then echo "warning: NUVDEV_FORCE unset - it will not work without a container"
fi
npm run package
dir=$(pwd)
mkdir -p /tmp/vs/extdir /tmp/vs/userdir
cd /tmp/vs
code --user-data-dir userdir  --extensions-dir extdir --disable-extensions $dir
