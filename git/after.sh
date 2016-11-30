echo "======== AFTER SCRIPT ========"
cd  /Users/vivekbhat/Desktop/checking/TestCodeFlagBot

git fetch --all

echo "git checkout branch"

git checkout branch

echo " "
echo " ======== inside BRANCH ========"
echo " "

yes | cp -i /Users/vivekbhat/Desktop/abc.txt /Users/vivekbhat/Desktop/checking/TestCodeFlagBot

echo " ======== COPY DONE ========"
echo " "

git config user.email "vivekbhat@live.com"

git add .
echo " "

git commit -m "Added something"

echo " ======== COMMIT DONE ========"

echo " "
echo "git push origin branch"
git push origin branch

echo " ======== PUSH DONE ========"
echo " ======== CLEANING ========"
echo " "
rm -rf /Users/vivekbhat/Desktop/checking
echo " ======== CLEANING DONE ========"
echo " "
echo "************* END **************"