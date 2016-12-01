echo "======== AFTER SCRIPT ========"

cd  $1

unset GIT_ASKPASS
git config user.email "softwerewolves@gmail.com"
git config user.username "flaglag"
git config user.password "1flaglagbot"

git fetch --all

echo "git checkout branch"

git checkout branch

echo " "

echo " ======== COPY DONE ========"
echo " "

git add .
echo " "

git commit -m "Committing parsing changes!"

echo " ======== COMMIT DONE ========"

echo " "
echo "git push origin master"
git push origin branch

echo " ======== PUSH DONE ========"

echo " "
echo "************* END **************"

cd ..
yes | rm -r Repo