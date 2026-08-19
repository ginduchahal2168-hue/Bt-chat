# Security Specification

## 1. Data Invariants
- Users can only edit their own profile document (`users/{userId}` where `userId == request.auth.uid`).
- Users can only access conversations where they are a member in `participantIds`.
- Messages can only be written to a conversation by a participant, and `senderId` must match `request.auth.uid`.
- Users can only read contacts inside their own subcollection `/users/{userId}/contacts/{contactId}`.
- Statuses can only be posted by the authenticated creator (`userId == request.auth.uid`) and viewed while valid (`expiresAt > request.time`).
- Call signaling records can only be created/updated by the caller (`callerId == request.auth.uid`) or receiver (`receiverId == request.auth.uid`).

## 2. The "Dirty Dozen" Threat Scenarios
1. **Identity Spoofing**: User A sends a message setting `senderId: 'user_B'`. Rejected by `senderId == request.auth.uid`.
2. **Conversation Hijacking**: User C tries to read/write messages in a conversation where `request.auth.uid` is not in `participantIds`. Rejected.
3. **Contact Theft**: User A attempts to list or delete contacts in `users/user_B/contacts`. Rejected by path ownership check.
4. **Junk ID Injection**: Attacker injects a 2KB junk character string as a document ID. Rejected by `isValidId()`.
5. **Payload Oversizing**: Attacker attempts to inject a 10MB text payload into message `content`. Rejected by `.size() <= 5000`.
6. **Status Expiry Tampering**: User attempts to update `userId` or overwrite other users' stories. Rejected by `isOwner` check.
7. **Call Signal Interception**: Third party eavesdrops on WebRTC SDP offer/answer tokens in `/calls/{callId}`. Rejected because only `callerId` and `receiverId` have read/write access.
8. **Shadow Field Injection**: User attempts to inject custom admin privileges or spoof verification flags.
9. **Message Deletion by Non-Author**: Non-sender attempts to delete another user's message. Rejected by sender/participant check.
10. **Profile Impersonation**: User A writes to `users/user_B`. Rejected because `userId != request.auth.uid`.
11. **Unauthenticated Read/Write**: Unauthenticated user queries database. Rejected by default-deny catchall.
12. **Blanket Query Scraping**: Malicious user lists entire user directory arbitrarily without proper constraints.
