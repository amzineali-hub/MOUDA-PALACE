import os
import zlib

for root, dirs, files in os.walk('.git/objects'):
    for file in files:
        if len(file) == 38:
            hash = os.path.basename(root) + file
            path = os.path.join(root, file)
            try:
                with open(path, 'rb') as f:
                    data = zlib.decompress(f.read())
                with open(f'/tmp/git-blobs/{hash}', 'wb') as f:
                    f.write(data)
            except Exception as e:
                pass
